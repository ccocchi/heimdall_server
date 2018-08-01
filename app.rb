# frozen_string_literal: true

require 'bundler'
require 'puma'
require 'sinatra'
require 'sinatra/cross_origin'
require 'influxdb'
require 'oj'

Oj.default_options = { mode: :compat }

module InfluxClient
  def self.init(env)
    @client = InfluxDB::Client.new("#{env}_metrics", time_precision: 'ms', retry: 0)
  end

  def self.instance
    @client
  end
end
InfluxClient.init(settings.environment)

configure {
  set :server, :puma
}

class QueryBuilder
  attr_reader :params

  def initialize(params)
    @params = params
    @period = params[:period] || '3h'
  end

  def transaction_details
    <<-SQL
    SELECT mean(*), count(total_time)
    FROM app
    WHERE endpoint = #{escape(params[:endpoint])} AND time >= now() - #{@period}
    GROUP BY time(#{grouping_interval})
    SQL
  end

  def transaction_details_kpis
    <<-SQL
    SELECT mean(total_time), percentile(total_time, 95)
    FROM app
    WHERE endpoint = #{escape(params[:endpoint])} AND time >= now() - #{@period}
    SQL
  end

  def transactions
    column = case params['sort_by']
    when 'slowest'    then 'mean(total_time)'
    when 'consuming'  then 'sum(total_time)'
    when 'throughput' then 'count(total_time)'
    end

    <<-SQL
    SELECT #{column} as value FROM app WHERE time >= now() - #{@period} GROUP BY endpoint
    SQL
  end

  private

  def grouping_interval
    case @period
    when '3h' then '5m'
    when '8h' then '10m'
    when '1d' then '30m'
    when '3d' then '2h'
    end
  end

  def escape(str)
    "'#{str}'"
  end
end

class ResultsParser
  RANGE = 5..-1

  def initialize(results, opts = {})
    @results = results
    @opts    = opts
  end

  # input: [
  #   {"name"=>"app", "tags"=>nil, "values"=>[{"time"=>"2018-07-05T09:45:00Z", "mean_elastic_time"=>292.4, "mean_ruby_time"=>12.4}]
  # output: [
  #  {"id"=>"mean_elastic_time", data: [{ "x": "2018-07-05T09:45:00Z", "y": 292.4}] },
  #  {"id"=>"mean_ruby_time", data: [{ "x": "2018-07-05T09:45:00Z", "y": 12.4}] }
  # ]
  #
  def to_graph_series
    series = Hash.new { |h, k| h[k] = [] }

    @results.each do |res|
      values = res['values']
      values.each do |vs|
        x = vs.delete('time'.freeze)
        vs.each do |id, value|
          value = value ? value.round(1) : 0
          series[id] << { x: x, y: value }
        end
      end
    end

    # Not needed for the moment (could be removed via the query direcly)
    series.delete('mean_total_time'.freeze)
    throughput = [{ id: 'throughput'.freeze, data: series.delete('count'.freeze) }]

    # mean_ruby_time => ruby
    series.keys.each { |k| series[k.split('_'.freeze)[1]] = series.delete(k) }

    result = []
    series.each { |id, data| result << { id: id, data: data } }

    { throughput: throughput, times: result }
  end

  # input: [{
  #   "name"=>"app",
  #   "tags"=>{"endpoint"=>"Influence::V1::HomeController#app_init"},
  #   "values"=>[{"time"=>"2018-07-05T11:43:28.253378Z", "value"=>314.75384615384615}]}
  # }]
  #
  # output: [{"endpoint"=>"Influence::V1::HomeController#app_init", "value"=>314.75}]
  def to_transactions_list
    result = @results.map do |point|
      {
        endpoint: point['tags']['endpoint'],
        value: point['values'][0]['value']
      }
    end

    case @opts[:mode]
    when 'consuming'
      total = result.sum { |h| h[:value] }
      result.each { |h| h[:value] = (h[:value].fdiv(total) * 100).round(2) }
    when 'throughput'
      result.each { |h| h[:value] = h[:value].fdiv(minutes_per_period).round(2) }
    else
      result.each { |h| h[:value] = h[:value].round }
    end

    result
  end

  private

  def minutes_per_period
    180 # 60 * 3 until we make this dynamic
  end
end

class ServerApp < Sinatra::Base
  configure do
    disable :static
    enable  :cross_origin
  end

  before do
    content_type :json
    response.headers['Access-Control-Allow-Origin'] = '*'
  end

  options '*' do
    response.headers['Allow'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, Accept'
    response.headers['Access-Control-Allow-Origin'] = '*'
    200
  end

  get '/transactions' do
    builder = QueryBuilder.new(params)
    results = InfluxClient.instance.query(builder.transactions)
    parser  = ResultsParser.new(results, mode: params['sort_by'])

    Oj.dump(parser.to_transactions_list)
  end

  get '/transactions/details' do
    endpoint = params[:endpoint]
    return 400 unless endpoint

    builder   = QueryBuilder.new(params)
    results   = InfluxClient.instance.query(builder.transaction_details)
    parser    = ResultsParser.new(results)

    response  = parser.to_graph_series
    results   = InfluxClient.instance.query(builder.transaction_details_kpis)
    response.merge!(
      (results.dig(0, 'values', 0) || {}).delete_if { |k, _| k == 'time'.freeze }
                                         .transform_values!(&:round))

    Oj.dump(response)
  end
end

use ServerApp

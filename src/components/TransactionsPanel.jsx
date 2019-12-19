import React from 'react';
import classnames from 'classnames';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import CardNumber from './CardNumber';
import CardChart from './CardChart';
import CardBarChart from './CardBarChart';
import ButtonsContainer from './ButtonsContainer';

import { fetchFromAPI } from '../api';
import { isEmpty, valueSortFn, convertTimeValuesFn } from '../utils';

class TransactionLine extends React.PureComponent {
  occupationPercent = () => {
    return (this.props.value / this.props.max) * 100;
  }

  render() {
    return (
      <div className={classnames("transaction-line", { current: this.props.current })} onClick={this.props.refreshFn(this.props.endpoint)}>
        <div className="ratio-line" style={{ width: `${this.occupationPercent()}%`}}></div>
        <div className="content">
          {this.props.endpoint}
          <div className="value">{this.props.value}{this.props.unit}</div>
        </div>
      </div>
    );
  }
}

class TransactionsPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sortValue: Object.keys(props.sortValues)[0],
      period: isEmpty(props.periodDataset) ? null : props.periodDataset[0].value,
      currentEndpoint: null,
      unit: 'ms',
      data: [],
      refreshing: false,
      detailsData: {
        breakdownData: null,
        throughputData: null,
        percentile: null,
        mean: null
      },
      max: 0,
      errorMsg: null
    };
  }

  unitForSort = sort => {
    switch (sort) {
      case 'slowest':
        return 'ms';
      case 'consuming':
        return '%';
      case 'throughput':
        return 'rpm';
      default:
        return 'ms';
    }
  }

  handleSelectChange = event => {
    const value = event.target.value;
    this.setState({ sortValue: value });
  }

  handlePeriodChange = value => () => {
    this.setState({ period: value });
  }

  handleRefreshClick = async () => {
    this.setState({ refreshing: true })

    // Let the CSS animation time to put sprinkles in the eyes of the users
    setTimeout(() => this.refreshData(), 500)
  }

  refreshDetails = endpoint => async () => {
    const params          = { endpoint: endpoint, period: this.state.period }
    const chartData       = await fetchFromAPI('/transactions/details', params);
    const breakdownData   = chartData.times.map(series => convertTimeValuesFn(series))
    const throughputData  = chartData.throughput.map(series => convertTimeValuesFn(series))

    this.setState({
      currentEndpoint: endpoint,
      refreshing: false,
      detailsData: {
        breakdownData: breakdownData,
        throughputData: throughputData,
        mean: chartData.mean,
        percentile: chartData.percentile,
        distributionData: chartData.distribution
      }
    });
  }

  async refreshData() {
    const params    = { sort_by: this.state.sortValue, period: this.state.period };
    const raw_data  = await fetchFromAPI('/transactions', params);

    if (isEmpty(raw_data)) {
      this.setState({ detailsData: {}, errorMsg: true, data: [], refreshing: false });
      return;
    }

    const data      = raw_data.sort(valueSortFn).slice(0, 15)
    const maxValue  = data.reduce((res, { value }) => value > res ? value : res, 0);

    const currentEndpoint = data[0].endpoint;
    const detailsParams   = { endpoint: currentEndpoint, period: this.state.period };
    const chartData       = await fetchFromAPI('/transactions/details', detailsParams);

    const breakdownData   = chartData.times.map(series => convertTimeValuesFn(series))
    const throughputData  = chartData.throughput.map(series => convertTimeValuesFn(series))

    this.setState({
      data: data,
      max: maxValue,
      currentEndpoint: currentEndpoint,
      detailsData: {
        breakdownData: breakdownData,
        throughputData: throughputData,
        mean: chartData.mean,
        percentile: chartData.percentile,
        distributionData: chartData.distribution
      },
      refreshing: false,
      unit: this.unitForSort(this.state.sortValue),
      errorMsg: false
    })
  }

  componentDidMount() {
    this.refreshData();
  }

  componentDidUpdate(_, prevState) {
    if (this.state.sortValue !== prevState.sortValue) {
      this.refreshData()
    }

    if (this.state.period !== prevState.period) {
      this.refreshData()
    }
  }

  renderSelect = () => {
    return(
      <FormControl>
        <InputLabel htmlFor="order-by">Sort by</InputLabel>
        <Select
          value={this.state.sortValue}
          onChange={this.handleSelectChange}
          inputProps={{
            name: 'orderBy',
            id: 'order-by',
          }}
        >
          {Object.entries(this.props.sortValues).map(([value, str]) => <MenuItem key={value} value={value}>{str}</MenuItem>)}
        </Select>
      </FormControl>
    )
  }

  renderPeriods = () => {
    return(
      <ButtonsContainer
        id="periods-buttons"
        label="Time range"
        dataset={this.props.periodDataset}
        selected={this.state.period}
        onChange={this.handlePeriodChange}
      />
    )
  }

  render() {
    const { sortValues, periodDataset } = this.props;
    const { data, max, unit, detailsData:{breakdownData, throughputData, mean, percentile, distributionData} } = this.state;

    return (
      <div className="panel panel__transactions">
        <div className="panel-left">
          <img
            className={classnames('refresh-img', { refreshing: this.state.refreshing })}
            src="./images/refresh.svg"
            alt="Refresh"
            onClick={this.handleRefreshClick}
          />
          <h3>Transactions</h3>

          <div className="panel-selectors">
            { isEmpty(sortValues) ? null : this.renderSelect() }
            { isEmpty(periodDataset) ? null : this.renderPeriods() }
          </div>

          { this.state.errorMsg ? <div className="error-msg">No data for selected period.</div> : null }

          <div className="transactions">
            {data.map(c =>
              <TransactionLine
                  {...c}
                  unit={unit}
                  max={max}
                  key={c.endpoint}
                  refreshFn={this.refreshDetails}
                  current={c.endpoint === this.state.currentEndpoint}
              />)}
          </div>
        </div>
        <div className="panel-right">
          <div className="row row__numbers">
            <CardNumber title="Avg response time" value={`${mean || '-'} ms`} />
            <CardNumber title="95th percentile" value={`${percentile || '-'} ms`} />
          </div>

          {distributionData &&
            <CardBarChart
              data={distributionData}
              title="Response time distribution"
            />
          }

          {breakdownData &&
            <CardChart
                series={breakdownData}
                period={this.state.period}
                guessXLabels
                showLegend
                enableArea
                title="Transaction breakdown"
                colors="pastel2"
            />}

          {throughputData &&
            <CardChart
                series={throughputData}
                period={this.state.period}
                guessXLabels
                title="Throughput"
                colors="d320c"
            />}
        </div>
      </div>
    )
  }
}

export default TransactionsPanel;

import React from 'react';
import { ResponsiveLine } from '@nivo/line';

class CardChart extends React.Component {

  /**
  * Guess ticks values for the X axis based on the data.
  *
  * Since data series will most likely contains around the same numbers of
  * points throughout the periods, and we want to display round values of time
  * (hours or half-hours), we find the first value being "round" then pick
  * every 6th value starting from it, resulting in ~ 8 tick values for every
  * period.
  *
  * @returns {Array} Array of tick values for X axis
  */
  guessXLabels = () => {
    const serie     = this.props.series[0].data;
    const idx       = serie.findIndex(({ x }) => x.endsWith('00'));
    const modResult = idx % 6;

    return serie.filter((_, i) => i % 6 === modResult).map(d => d.x);
  }

  shouldComponentUpdate(nextProps) {
    // Avoid re-rendering graph in shadow DOM when period change but
    // before data has been fetched
    return this.props.series !== nextProps.series;
  }

  render() {
    return(
      <div className="card card__chart">
        {this.props.title && <div className="card-title">{this.props.title}</div>}

        <ResponsiveLine
            colors={this.props.colors}
            data={this.props.series}
            stacked={true}
            enableDots={false}
            enableArea={this.props.enableArea}
            animate={false}
            enableGridX={false}
            enableGridY={false}
            margin={{
              "top": 10,
              "bottom": 60,
              "left": 40
            }}
            axisLeft={{
              "orient": "left",
              "tickSize": 5,
              "tickPadding": 5,
              "tickRotation": 0,
              "tickCount": 3
            }}
            axisBottom={{
              "orient": "bottom",
              "tickSize": 5,
              "tickCount": 3,
              "tickValues": this.props.guessXLabels ? this.guessXLabels() : null,
              "format": (label) => label.slice(3)
            }}
            legends={ this.props.showLegend ? [
              {
                "anchor": "bottom",
                "direction": "row",
                "translateY": 50,
                "itemWidth": 70,
                "itemHeight": 20,
                "symbolSize": 12,
                "symbolShape": "circle"
              }
            ] : []}
            minY="auto"
        />
      </div>
    )
  }
}

export default CardChart

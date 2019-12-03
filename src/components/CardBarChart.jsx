import React from 'react';
import { ResponsiveBar } from '@nivo/bar';

function Tooltip(props) {
  return (
    <div className="tooltip">
      <div className="">{props.data.label}</div>
      <div className="">{props.value} requests</div>
    </div>
  )
}

const tooltipTheme = {
  tooltip: {
    container: {
      background: 'rgba(34, 34, 34, 0.7)',
      color: '#fff',
      fontSize: '0.8em'
    }
  }
}

class CardBarChart extends React.Component {
  render() {
    const { title, data } = this.props;

    return(
      <div className="card card__chart">
        {title && <div className="card-title">{title}</div>}

        <div className="chart">
          <ResponsiveBar
            data={data}
            theme={tooltipTheme}
            enableLabel={false}
            enableGridY={false}
            enableGridX={false}
            animate={false}
            margin={{
              bottom: 20
            }}
            tooltip={data => Tooltip(data)}
            colors={['#a8dbd8']}
            axisLeft={null}
            axisBottom={{
              tickValues: [0, 1, 2, 3, 4, 5]
            }}
          />
        </div>
      </div>
    )
  }
}

export default CardBarChart;

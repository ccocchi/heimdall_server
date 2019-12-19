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

        <div class="legend">
          <div>{data.min}ms</div>
          <div>{data.max}ms</div>
        </div>

        <div className="chart">
          <ResponsiveBar
            data={data.serie}
            theme={tooltipTheme}
            enableLabel={false}
            enableGridY={true}
            gridYValues={[0]}
            enableGridX={false}
            animate={false}
            margin={{
              bottom: 15
            }}
            tooltip={data => Tooltip(data)}
            colors={['#a8dbd8']}
            axisLeft={null}
            axisBottom={null}
          />
        </div>
      </div>
    )
  }
}

export default CardBarChart;

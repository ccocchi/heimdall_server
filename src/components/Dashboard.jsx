import React from 'react';
import TransactionsPanel from './TransactionsPanel';

// const data = [
//   {
//     endpoint: "/v1/influence/search",
//     avg_time: 5399
//   },
//   {
//     endpoint: "V1::ProfilesController#search",
//     avg_time: 5240
//   },
//   {
//     endpoint: "/catalog/search",
//     avg_time: 4325
//   },
//   {
//     endpoint: "/v1/forms/website_contact",
//     avg_time: 3869
//   },
//   {
//     endpoint: "/v1/profiles/:id/snas_stats",
//     avg_time: 3518
//   },
//   {
//     endpoint: "/v1/influence/search",
//     avg_time: 3200
//   },
//   {
//     endpoint: "V1::ProfilesController#search",
//     avg_time: 2930
//   },
//   {
//     endpoint: "/catalog/search",
//     avg_time: 2409
//   },
//   {
//     endpoint: "/v1/forms/website_contact",
//     avg_time: 1208
//   },
//   {
//     endpoint: "/v1/profiles/:id/snas_stats",
//     avg_time: 1198
//   }
// ]
// const max = 5399
//


class Dashboard extends React.Component {
  render() {
    return (
      <div className="main-container">
        <div className="menu">
          <h3>Monitoring</h3>
          <ul>
            <li><a href="#">Overview</a></li>
            <li className="current"><a href="#">Transactions</a></li>
            <li><a href="#">Databases</a></li>
          </ul>
        </div>
        <div className="content">
          <TransactionsPanel
            sortValues={{
              slowest: 'Slowest avg. query time',
              consuming: 'Most time consuming',
              throughput: 'Throughput'
            }}

            periodDataset={[
              { label: '3h', value: '3h'},
              { label: '12h', value: '12h'},
              { label: '1d', value: '1d'},
              { label: '3d', value: '3d'}
            ]}
          />
        </div>
      </div>
    );
  }
}

export default Dashboard

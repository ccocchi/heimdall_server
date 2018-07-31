import React from 'react'
import PropTypes from 'prop-types';
import PropTypesCustom from '../propTypes';

import ToggleButton from './ToggleButton'

class ButtonsContainer extends React.Component {
  onChange = value => () => {}

  render() {
    const { dataset, className } = this.props;

    return(
      <div className={className}>
        {dataset.map((item, i) => <ToggleButton
          id={item.label}
          key={`${i}-${item.label}`}
          label={item.label}
          onToggle={this.onChange(item.value)}
        />)}
      </div>
    )
  }
}

ButtonsContainer.propTypes = {
	id: PropTypes.string.isRequired,
  dataset: PropTypes.arrayOf(PropTypes.shape({
		value: PropTypesCustom.StringOrNumber.isRequired,
		label: PropTypes.string.isRequired,
	})).isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypesCustom.StringOrReact,
  className: PropTypes.string
}

export default ButtonsContainer

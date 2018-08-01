import React from 'react'
import PropTypes from 'prop-types';
import PropTypesCustom from '../propTypes';

import classnames from 'classnames';

import ToggleButton from './ToggleButton'

class ButtonsContainer extends React.PureComponent {
  render() {
    const { dataset, className, selected, onChange } = this.props;

    return(
      <div className={classnames('buttons-container', className)}>
        {this.props.label && <label data-shrink="true">{this.props.label}</label>}

        <div className={classnames('buttons-container-inner')}>
          {dataset.map((item, i) => <ToggleButton
            id={item.label}
            key={`${i}-${item.label}`}
            active={selected === item.value}
            label={item.label}
            onToggle={onChange(item.value)}
          />)}
        </div>
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
  selected: PropTypesCustom.StringOrNumber.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypesCustom.StringOrReact,
  className: PropTypes.string
}

export default ButtonsContainer

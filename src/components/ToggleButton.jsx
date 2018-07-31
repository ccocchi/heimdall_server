import React from 'react';
import PropTypes from 'prop-types';
import PropTypesCustom from '../propTypes';

const ToggleButton = ({ id, label, active, disabled, className, onToggle }) => {
  return (
    <button
      id={id}
      disabled={disabled}
      className={className}
      onClick={() => onToggle() }
    >{label}</button>
  )
}

ToggleButton.defaultProps = {
	disabled: false,
	active: false
}

ToggleButton.propTypes = {
	id: PropTypes.string.isRequired,
	onToggle: PropTypes.func.isRequired,
	active: PropTypes.bool,
	label: PropTypesCustom.StringOrReact,
	disabled: PropTypes.bool,
	className: PropTypes.string,
}

export default ToggleButton;

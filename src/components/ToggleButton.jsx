import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import PropTypesCustom from '../propTypes';

const ToggleButton = ({ id, label, active, disabled, className, onToggle }) => {
  return (
    <button
      id={id}
      disabled={disabled}
      className={classnames(className, { active })}
      onClick={() => onToggle() }
    >{label}</button>
  )
}

ToggleButton.defaultProps = {
	disabled: false,
	active: false,
  className: ''
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

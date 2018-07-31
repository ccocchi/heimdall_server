import PropTypes from 'prop-types'

const helpers = {
  StringOrNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  StringOrReact: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
}

export default helpers

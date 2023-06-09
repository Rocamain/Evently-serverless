/* eslint-disable no-case-declarations */
const createErrorMsg = ({
  keyword,
  instancePath,
  params,
  message,
  ...rest
}) => {
  const field = instancePath.replace('/', '')

  switch (keyword) {
    case 'required':
      return `${message}.`
    case 'enum':
      const enumValues = params.allowedValues.join(', ')
      return `${field} ${message}: ${enumValues}.`
    case 'type':
      return `${field}, ${message}.`
    case 'minimum':
      return `${field}, ${message}.`
    case 'format':
      return `${message.replaceAll('"', '')}.`
    case 'additionalProperties':
      return `${message}.`
    default:
      return `${field}, ${message}.`
  }
}

module.exports = createErrorMsg

import React from 'react'
import MUITextField from 'material-ui/TextField'

function TextField(props) {
  const { field, formikProps, ...rest } = props

  const { handleChange, handleBlur, values, touched, errors } = formikProps

  return (
    <MUITextField
      id={field}
      name={field}
      onChange={handleChange}
      onBlur={handleBlur}
      value={values[field]}
      error={touched[field] && !!errors[field]}
      helperText={touched[field] && !!errors[field] && errors[field]}
      {...rest}
    />
  )
}

export default TextField

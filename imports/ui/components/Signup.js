import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'
import { Formik } from 'formik'
import yup from 'yup'
import { withStyles } from 'material-ui/styles'
import Typography from 'material-ui/Typography'
import TextField from 'material-ui/TextField'
import Button from 'material-ui/Button'
import Paper from 'material-ui/Paper'
import { FormControl, FormHelperText } from 'material-ui/Form'
import InputLabel from 'material-ui/Input/InputLabel'
import Input, { InputAdornment } from 'material-ui/Input'
import IconButton from 'material-ui/IconButton/IconButton'
import Visibility from 'material-ui-icons/Visibility'
import VisibilityOff from 'material-ui-icons/VisibilityOff'

const schema = yup.object().shape({
  firstName: yup.string().required('Required').min,
  lastName: yup
    .string()
    .max(32, 'Sorry, last name cannot exceed 1024 bits or 32 characters'),
  email: yup.string().email(),
  receiveEmails: yup.boolean(),
  password: yup
    .string()
    .required('Password all the things')
    .min(6, 'Yikes! Add a few bangs to the end!!!')
    .max(32, 'Are you sure you can you remember that?'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Password mismatch :(')
    .required('Password all the things'),
})

const Signup = props => (
  <Paper>
    <Typography type="title">Sign up</Typography>
    <p>This can be anywhere in your application</p>
    <Formik
      validationSchema={schema}
      initialValues={{
        firstName: '',
        lastName: '',
        email: '',
        receiveEmails: true,
        password: '',
        confirmPassword: '',
      }}
      onSubmit={(
        values,
        { setSubmitting, setErrors /* setValues and other goodies */ },
      ) => {
        Meteor.loginWithPassword(values.email, values.password, error => {
          setSubmitting(false)
          if (error) {
            setErrors({ email: error.reason })
          } else {
            props.history.push('/player')
          }
        })
      }}
      render={({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
      }) => (
        <form onSubmit={handleSubmit} className={props.classes.container}>
          <TextField
            label="First Name"
            id="firstName"
            type="firstName"
            name="firstName"
            className={props.classes.textField}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.firstName}
            margin="normal"
            required
            error={touched.firstName && errors.firstName}
            helperText={touched.firstName && errors.firstName}
          />
          <TextField
            label="Last Name"
            id="lastName"
            type="lastName"
            name="lastName"
            className={props.classes.textField}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.lastName}
            margin="normal"
            required
            error={touched.lastName && errors.lastName}
            helperText={touched.lastName && errors.lastName}
          />
          <TextField
            label="Email"
            id="email"
            type="email"
            name="email"
            className={props.classes.textField}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.email}
            margin="normal"
            required
            error={touched.email && errors.email}
            helperText={touched.email && errors.email}
          />

          <PasswordField
            label="Password"
            id="password"
            inputClassName={props.classes.textField}
            onChange={handleChange}
            onBlur={handleBlur}
            values={values}
            touched={touched}
            errors={errors}
          />
          <PasswordField
            label="Confirm Password"
            id="confirmPassword"
            inputClassName={props.classes.textField}
            onChange={handleChange}
            onBlur={handleBlur}
            values={values}
            touched={touched}
            errors={errors}
          />
          <Button type="submit" disabled={isSubmitting}>
            Submit
          </Button>
        </form>
      )}
    />
  </Paper>
)

const passwordFieldStyles = theme => ({
  formControl: {
    margin: theme.spacing.unit,
  },
})
const PasswordField = withStyles(passwordFieldStyles)(props => {
  const {
    errors,
    label,
    id,
    inputClassName,
    handleChange,
    handleBlur,
    helperText,
    values,
    touched: touches,
    classes,
  } = props
  const value = values[id]
  const touched = touches[id]
  const error = errors[id]
  return (
    <FormControl className={classes.formControl} margin="normal">
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <ToggleState default={false}>
        {({ on: showPassword, toggle: toggleShowPassword }) => (
          <Input
            id={id}
            type={showPassword ? 'text' : 'password'}
            name={id}
            className={inputClassName}
            onChange={handleChange}
            onBlur={handleBlur}
            value={value}
            required
            error={touched && error}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={toggleShowPassword}
                  onMouseDown={event => event.preventDefault()}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
          />
        )}
      </ToggleState>
      <FormHelperText>{touched && error ? error : helperText}</FormHelperText>
    </FormControl>
  )
})

class ToggleState extends Component {
  constructor(props) {
    super(props)
    this.state = {
      on: props.default || false,
    }
  }

  toggle = () => {
    this.setState(({ on }) => ({ on: !on }))
  }

  render() {
    const { on } = this.state
    const renderProps = {
      on,
      off: !on,
      toggle: this.toggle,
    }
    return this.props.render
      ? this.props.render(renderProps)
      : this.props.children(renderProps)
  }
}

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    padding: 20,
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
})

export default withStyles(styles)(Signup)

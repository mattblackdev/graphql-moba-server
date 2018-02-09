import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'
import { Formik } from 'formik'
import yup from 'yup'
import { withStyles } from 'material-ui/styles'
import Grid from 'material-ui/Grid'
import Typography from 'material-ui/Typography'
import TextField from 'material-ui/TextField'
import Button from 'material-ui/Button'
import { FormControl, FormHelperText } from 'material-ui/Form'
import InputLabel from 'material-ui/Input/InputLabel'
import Input, { InputAdornment } from 'material-ui/Input'
import IconButton from 'material-ui/IconButton/IconButton'
import Visibility from 'material-ui-icons/Visibility'
import VisibilityOff from 'material-ui-icons/VisibilityOff'

// Form validation schema using 'yup'
const schema = yup.object().shape({
  username: yup
    .string()
    .min(2, 'A byte too short')
    .max(32, 'A byte too long'),
  password: yup
    .string()
    .min(6, 'A byte too short')
    .max(32, 'A byte too long'),
})

// Login is a stateless functional component
const Login = props => (
  <Grid
    container
    direction="column"
    justify="center"
    alignItems="center"
    className={props.classes.container}
  >
    <Grid item xs={10} sm={8} md={6} lg={4}>
      <Typography type="display2" color="secondary" gutterBottom>
        Welcome
      </Typography>
      <Formik
        validationSchema={schema}
        initialValues={{
          username: '',
          password: '',
        }}
        onSubmit={(
          values,
          { setSubmitting, setErrors /* setValues and other goodies */ }
        ) => {
          Meteor.loginWithPassword(values.username, values.password, error => {
            setSubmitting(false)
            if (error) {
              if (error.error === 403) {
                setErrors({ username: error.reason })
              } else {
                setErrors({ server: error.reason })
              }
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
          <form onSubmit={handleSubmit}>
            <TextField
              label="Hacker Name"
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              autoFocus
              className={props.classes.textField}
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.username}
              margin="normal"
              fullWidth
              error={touched.username && !!errors.username}
              helperText={touched.username && errors.username}
            />
            <PasswordField
              label="Password"
              id="password"
              className={props.classes.textField}
              onChange={handleChange}
              onBlur={handleBlur}
              values={values}
              touched={touched}
              errors={errors}
              autoComplete="password"
            />
            {errors.server && (
              <Typography type="body1" color="error" gutterBottom>
                {errors.server}
              </Typography>
            )}
            <div style={{ textAlign: 'right', marginTop: 24 }}>
              <Button type="submit" color="secondary" disabled={isSubmitting}>
                Login
              </Button>
            </div>
          </form>
        )}
      />
    </Grid>
  </Grid>
)

function PasswordField({
  errors,
  label,
  id,
  onChange,
  onBlur,
  helperText,
  values,
  touched: touches,
  className,
  autoComplete,
  required,
}) {
  const value = values[id]
  const touched = touches[id]
  const error = errors[id]
  return (
    <FormControl
      className={className}
      margin="normal"
      fullWidth
      error={touched && !!error}
      required={required}
    >
      <InputLabel htmlFor={id} required>
        {label}
      </InputLabel>
      <ToggleState default={false}>
        {({ on: showPassword, toggle: toggleShowPassword }) => (
          <Input
            id={id}
            type={showPassword ? 'text' : 'password'}
            name={id}
            onChange={onChange}
            onBlur={onBlur}
            value={value}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={toggleShowPassword}
                  onMouseDown={event => event.preventDefault()}
                  id={`${id}-visibility`}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            autoComplete={autoComplete}
          />
        )}
      </ToggleState>
      <FormHelperText>{touched && error ? error : helperText}</FormHelperText>
    </FormControl>
  )
}

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

const styles = theme => {
  const bigSpace = `${theme.spacing.unit * 10}px`
  return {
    container: {
      flexGrow: 1,
      marginTop: bigSpace,
    },
  }
}

export default withStyles(styles)(Login)

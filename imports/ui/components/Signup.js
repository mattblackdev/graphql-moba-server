import { Accounts } from 'meteor/accounts-base'
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
    .required('This is definitely a required field')
    .min(2, '2 character minimum homie')
    .max(32, 'Sorry, 1024 bit limit'),
  email: yup.string().email(),
  password: yup
    .string()
    .required('Password all the things')
    .min(6, 'Too short. Totally hackable')
    .max(32, 'Are you sure you can you remember that?'),
})

// Signup is a stateless functional component
const Signup = props => (
  <Grid
    container
    direction="column"
    justify="center"
    alignItems="center"
    className={props.classes.container}
  >
    <Grid item xs={10} sm={8} md={6} lg={4}>
      <Typography type="display2" color="secondary" gutterBottom>
        Join the League
      </Typography>
      <Typography type="subheading">
        Fear not... the next step is better.
      </Typography>
      <Formik
        validationSchema={schema}
        initialValues={{
          username: '',
          email: '',
          password: '',
        }}
        onSubmit={(
          values,
          { setSubmitting, setErrors /* setValues and other goodies */ },
        ) => {
          Accounts.createUser(
            {
              username: values.username,
              email: values.email,
              password: values.password,
            },
            error => {
              setSubmitting(false)
              if (error) {
                if (error.error === 403) {
                  setErrors({ username: error.reason })
                } else {
                  setErrors({ server: error.reason })
                }
              } else {
                props.history.push('/player')
              }
            },
          )
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
              autoComplete="new-username"
              autoFocus
              className={props.classes.textField}
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.username}
              margin="normal"
              fullWidth
              required
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
              autoComplete="new-password"
            />
            <TextField
              label="Email"
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              className={props.classes.textField}
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.email}
              margin="normal"
              fullWidth
              error={touched.email && !!errors.email}
              helperText={
                touched.email && !!errors.email
                  ? errors.email
                  : 'If you want to get rad emails from Matt Black'
              }
            />
            {errors.server && (
              <Typography type="body1" color="error" gutterBottom>
                {errors.server}
              </Typography>
            )}
            <div style={{ textAlign: 'right', marginTop: 24 }}>
              <Button type="submit" color="secondary" disabled={isSubmitting}>
                Submit
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
      required
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

export default withStyles(styles)(Signup)

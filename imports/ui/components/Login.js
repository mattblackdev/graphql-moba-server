import { Meteor } from 'meteor/meteor'
import React from 'react'
import { Formik } from 'formik'

const Login = () => (
  <div>
    <h1>My Form</h1>
    <p>This can be anywhere in your application</p>
    <Formik
      initialValues={{
        email: '',
        password: '',
      }}
      validate={values => {
        // same as above, but feel free to move this into a class method now.
        const errors = {}
        if (!values.email) {
          errors.email = 'Required'
        } else if (
          !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)
        ) {
          errors.email = 'Invalid email address'
        }
        return errors
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
            this.props.history.push('/player')
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
          <input
            type="email"
            name="email"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.email}
          />
          {touched.email && errors.email && <div>{errors.email}</div>}
          <input
            type="password"
            name="password"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.password}
          />
          {touched.password && errors.password && <div>{errors.password}</div>}
          <button type="submit" disabled={isSubmitting}>
            Submit
          </button>
        </form>
      )}
    />
  </div>
)

export default Login

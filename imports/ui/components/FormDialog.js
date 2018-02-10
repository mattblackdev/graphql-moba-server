import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Formik } from 'formik'
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog'
import Button from 'material-ui/Button'

class FormDialog extends Component {
  static propTypes = {
    opener: PropTypes.func.isRequired,
  }

  state = {
    open: false,
  }

  /**
   * The dialog can serve many purposes by opening with a completely new state
   * this should be validated eventually, but for now newState should have:
   *
   *  title: string
   *  contentText: string
   *  validationSchema: yup schema object
   *  initialValues: formik initialValues
   *  render: formik render prop
   *  onSubmit: formik/dialog submit handler
   */
  handleOpen = newState => {
    this.setState(() => ({
      ...newState,
      open: true,
    }))
  }

  handleClose = () => {
    this.setState({
      open: false,
    })
  }

  /**
   * Calls the onSubmit passed via handleOpen with the
   * formik submit args and the dialog close function
   * (values, options: { setSubmitting, setErrors }, handleClose)
   */
  handleSubmit = (...formikSubmitArgs) => {
    this.state.onSubmit(...formikSubmitArgs, this.handleClose)
  }

  render() {
    const {
      open,
      title,
      contentText,
      validationSchema,
      initialValues,
      render,
    } = this.state
    return (
      <Fragment>
        {this.props.opener(this.handleOpen)}
        <Dialog open={open}>
          <DialogTitle>{title}</DialogTitle>
          <Formik
            validationSchema={validationSchema}
            initialValues={initialValues}
            onSubmit={this.handleSubmit}
            render={formikProps => {
              const { handleSubmit, isSubmitting } = formikProps
              return (
                <form onSubmit={handleSubmit}>
                  <DialogContent>
                    <DialogContentText>{contentText}</DialogContentText>
                    {render(formikProps)}
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={this.handleClose}>Cancel</Button>
                    <Button
                      type="submit"
                      color="secondary"
                      disabled={isSubmitting}
                    >
                      Submit
                    </Button>
                  </DialogActions>
                </form>
              )
            }}
          />
        </Dialog>
      </Fragment>
    )
  }
}

export default FormDialog

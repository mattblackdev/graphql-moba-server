import React, { Component } from 'react'
import PropTypes from 'prop-types'
import yup from 'yup'
import IconButton from 'material-ui/IconButton'
import AddIcon from 'material-ui-icons/Add'
import EditIcon from 'material-ui-icons/Edit'

import FormDialog from './FormDialog'
import TextField from './TextField'

const schema = yup.object().shape({
  color: yup
    .string()
    .required('This is definitely a required field')
    .min(3, 'Is that really a colour?')
    .max(32, 'Never heard of that colour'),
})

class TeamDialog extends Component {
  static propTypes = {
    addTeam: PropTypes.func.isRequired,
    team: PropTypes.shape({
      color: PropTypes.string.isRequired,
    }),
  }

  static defaultProps = {
    team: null,
  }

  handleOpen = openWithState => () => {
    const { team } = this.props
    const title = team ? 'Edit Team' : 'New Team'
    openWithState({
      title,
      contentText:
        'Enter a colour for your team. Use a css colour name for best results!',
      validationSchema: schema,
      initialValues: {
        color: team ? team.color : '',
      },
      render: this.renderFields,
      onSubmit: this.handleSubmit,
    })
  }

  handleSubmit = (values, { setSubmitting, setErrors }, handleClose) => {
    this.props.addTeam(values.color, error => {
      setSubmitting(false)
      if (error) {
        setErrors({ color: error.reason })
      } else {
        handleClose()
      }
    })
  }

  renderFields = formikProps => (
    <TextField
      formikProps={formikProps}
      label="Colour"
      field="color"
      margin="dense"
      fullWidth
      autoFocus
    />
  )

  render() {
    const { team } = this.props
    return (
      <FormDialog
        opener={openWithState => (
          <IconButton onClick={this.handleOpen(openWithState)}>
            {team ? <EditIcon /> : <AddIcon />}
          </IconButton>
        )}
      />
    )
  }
}

export default TeamDialog

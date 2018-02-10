import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import yup from 'yup'
import Button from 'material-ui/Button'
import AddIcon from 'material-ui-icons/Add'
import EditIcon from 'material-ui-icons/Edit'
import { InputLabel } from 'material-ui/Input'
import { MenuItem } from 'material-ui/Menu'
import { ListItemText } from 'material-ui/List'
import { FormControl, FormHelperText } from 'material-ui/Form'
import Select from 'material-ui/Select'
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from 'material-ui/Table'

import FormDialog from './FormDialog'

const schema = yup.object().shape({
  clazz: yup.string().required('You must make a selection!'),
})

class ClassSelectionDialog extends Component {
  handleOpen = openWithState => () => {
    const { game } = this.props
    const player = game.getUserPlayer()

    openWithState({
      title: 'Class Selection',
      contentText: 'Choose your class',
      validationSchema: schema,
      initialValues: {
        clazz: player.class ? player.class._id : '',
      },
      render: this.renderFields,
      onSubmit: this.handleSubmit,
    })
  }

  handleSubmit = (values, { setSubmitting, setErrors }, handleClose) => {
    this.props.game.setClass(values.clazz, error => {
      setSubmitting(false)
      if (error) {
        setErrors({ clazz: error.reason })
      } else {
        handleClose()
      }
    })
  }

  renderFields = ({ values, errors, touched, handleChange }) => {
    const error = touched.clazz && !!errors.clazz
    const { clazzes } = this.props
    const selectedClass = clazzes.find(clazz => values.clazz === clazz._id)
    return (
      <Fragment>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Skills</TableCell>
              <TableCell>Health</TableCell>
              <TableCell>Attack</TableCell>
              <TableCell>Defense</TableCell>
              <TableCell>Speed</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clazzes.map(c => {
              return (
                <TableRow key={c._id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>skills</TableCell>
                  <TableCell>{c.health}</TableCell>
                  <TableCell>{c.attack}</TableCell>
                  <TableCell>{c.defense}</TableCell>
                  <TableCell>{c.speed}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        <FormControl error={error} fullWidth>
          <InputLabel htmlFor="clazz">Class</InputLabel>
          <Select
            value={values.clazz}
            onChange={handleChange}
            inputProps={{
              name: 'clazz',
              id: 'clazz',
            }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {clazzes.map(clazz => (
              <MenuItem key={clazz._id} value={clazz._id}>
                <ListItemText
                  primary={clazz.name}
                  secondary={clazz.description}
                />
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            {error ? errors.clazz : 'Choose wisely'}
          </FormHelperText>
        </FormControl>
      </Fragment>
    )
  }

  render() {
    return (
      <FormDialog
        opener={openWithState => (
          <Button onClick={this.handleOpen(openWithState)}>Change Class</Button>
        )}
      />
    )
  }
}

export default ClassSelectionDialog

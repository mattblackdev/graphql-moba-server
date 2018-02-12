import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import yup from 'yup'
import Button from 'material-ui/Button'
import AddIcon from 'material-ui-icons/Add'
import EditIcon from 'material-ui-icons/Edit'
import Grid from 'material-ui/Grid'
import Typography from 'material-ui/Typography'
import {
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  ExpansionPanelActions,
} from 'material-ui/ExpansionPanel'
import ExpandMoreIcon from 'material-ui-icons/ExpandMore'
import Radio from 'material-ui/Radio'
import { FormHelperText } from 'material-ui/Form'
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from 'material-ui/Table'

import capitilize from '/imports/utils/capitilize'
import FormDialog from './FormDialog'
import DarkExpansionPanel from './DarkExpansionPanel'

const schema = yup.object().shape({
  clazz: yup.string().required('You must make a selection!'),
})

function TableSection({ title, children }) {
  return (
    <Fragment>
      <Typography variant="subheading">{title}</Typography>
      <div style={{ overflowX: 'scroll', marginBottom: 16 }}>{children}</div>
    </Fragment>
  )
}

function StatsTable({ clazz }) {
  return (
    <TableSection title="Stats">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Stat</TableCell>
            <TableCell>Rating</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Health</TableCell>
            <TableCell>{capitilize(clazz.health)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Attack</TableCell>
            <TableCell>{capitilize(clazz.attack)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Defense</TableCell>
            <TableCell>{capitilize(clazz.defense)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Speed</TableCell>
            <TableCell>{capitilize(clazz.speed)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableSection>
  )
}

function SkillsTable({ skills }) {
  return (
    <TableSection title="Skills">
      <Table style={{ minWidth: 500 }}>
        <TableHead>
          <TableRow>
            <TableCell padding="dense">Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell padding="dense">Cooldown (s)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {skills.map(skill => (
            <TableRow key={skill._id}>
              <TableCell padding="dense">{skill.name}</TableCell>
              <TableCell>{skill.description}</TableCell>
              <TableCell padding="dense">{skill.cooldown}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableSection>
  )
}

class ClassSelectionDialog extends Component {
  handleOpen = openWithState => () => {
    const { game } = this.props
    const player = game.getUserPlayer()

    openWithState({
      title: 'Choose your class',
      contentText: '',
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
    return (
      <Fragment>
        {clazzes.map(clazz => {
          const selected = clazz._id === values.clazz
          const skills = this.props.skills.filter(skill =>
            clazz.skillIds.includes(skill._id)
          )
          return (
            <DarkExpansionPanel key={clazz._id}>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Radio
                  checked={selected}
                  name="clazz"
                  onClick={e => {
                    e.stopPropagation()
                  }}
                  onChange={handleChange}
                  value={clazz._id}
                />
                <Typography
                  color={selected ? 'secondary' : undefined}
                  variant="title"
                  style={{ flex: 1, alignSelf: 'center' }}
                >
                  {clazz.name}
                </Typography>
                <span />
                {/* MUI applies extra padding to the last element in ExpansionPanelSummary */}
              </ExpansionPanelSummary>
              <ExpansionPanelDetails style={{ flexDirection: 'column' }}>
                <Typography variant="caption" style={{ marginBottom: 20 }}>
                  {clazz.description}
                </Typography>
                <StatsTable clazz={clazz} />
                <SkillsTable skills={skills} />
              </ExpansionPanelDetails>
            </DarkExpansionPanel>
          )
        })}
        {error && <FormHelperText error>{errors.clazz}</FormHelperText>}
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

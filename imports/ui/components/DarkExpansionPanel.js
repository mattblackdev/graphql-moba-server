import React from 'react'
import MUIExpansionPanel from 'material-ui/ExpansionPanel'
import { withStyles } from 'material-ui/styles'

const DarkExpansionPanel = withStyles(theme => ({
  expansionPanel: {
    backgroundColor: theme.palette.primary.dark,
  },
}))(({ classes, ...rest }) => (
  <MUIExpansionPanel className={classes.expansionPanel} {...rest} />
))

export default DarkExpansionPanel

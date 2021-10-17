import React from 'react'
import { FileSelector } from '@jbrowse/core/ui'
import { getSession } from '@jbrowse/core/util'
import { Paper, makeStyles } from '@material-ui/core'
import { observer } from 'mobx-react'

// locals
import { AddTrackModel } from '../model'

const useStyles = makeStyles(theme => ({
  paper: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(1),
  },
  spacer: {
    height: theme.spacing(8),
  },
}))

function TrackSourceSelect({ model }: { model: AddTrackModel }) {
  const classes = useStyles()
  const session = getSession(model)

  return (
    <Paper className={classes.paper}>
      <FileSelector
        name="Main file"
        description=""
        location={model.trackData}
        setLocation={model.setTrackData}
        setName={model.setTrackName}
        session={session}
      />
      <div className={classes.spacer} />
      <FileSelector
        name="Index file"
        description="(Optional) The URL of the index file is automatically inferred from the URL of the main file if it is not supplied."
        location={model.indexTrackData}
        setLocation={model.setIndexTrackData}
        setName={model.setTrackName}
        session={session}
      />
    </Paper>
  )
}

export default observer(TrackSourceSelect)

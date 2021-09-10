import React, { useState, useEffect } from 'react';

import moment from 'moment';

import {
  Button,
  Hidden,
  makeStyles,
  Select,
  MenuItem,
} from '@material-ui/core';

import { EditCircleModal } from '../EditCircleModal';
import { EditEpochModal } from '../EditEpochModal';
import { ReactComponent as EditAdminSVG } from 'assets/svgs/button/edit-admin.svg';
import { useUserInfo } from 'hooks';
import { getCSVPath } from 'utils/domain';
import { capitalizedName } from 'utils/string';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  circleContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  circleTitle: {
    margin: 0,
    fontSize: 40,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  editButton: {
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(0.5),
    padding: theme.spacing(1.5, 3),
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'none',
    color: theme.colors.white,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    background: theme.colors.lightGray,
    borderRadius: theme.spacing(1),
    filter: 'drop-shadow(2px 3px 6px rgba(81, 99, 105, 0.33))',
  },
  editAdminIconWrapper: {
    width: theme.spacing(1.25),
    height: theme.spacing(2.5),
    marginRight: theme.spacing(1),
  },
  csvContainer: {
    marginTop: theme.spacing(0.5),
    display: 'flex',
    flexDirection: 'row',
    '& > .MuiInput-root': {
      marginLeft: theme.spacing(1),
      marginTop: theme.spacing(0.75),
      color: 'rgba(81, 99, 105, 0.35)',
    },
  },
  csv: {
    marginTop: theme.spacing(2),
    fontSize: 12,
    fontWeight: 600,
    color: 'rgba(81, 99, 105, 0.35)',
  },
  epochContainer: {
    marginLeft: theme.spacing(10),
    maxWidth: theme.spacing(45),
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    marginTop: theme.spacing(2),
    marginBottom: 0,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'rgba(81, 99, 105, 0.5)',
  },
  description: {
    marginTop: theme.spacing(0.5),
    marginBottom: 0,
    maxHeight: 100,
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    wordWrap: 'break-word',
    whiteSpace: 'pre-line',
    '&:last-of-type': {
      overflow: 'auto',
      overflowY: 'scroll',
    },
  },
}));

export const Header = () => {
  const classes = useStyles();
  const { circle, epoch, epochs, pastEpochs } = useUserInfo();
  const [selectedEpochId, setSelectedEpochId] = useState<number>(
    pastEpochs?.[0]?.id ?? -1
  );
  const [isEditCircle, setEditCircle] = useState<boolean>(false);
  const [isEditEpoch, setEditEpoch] = useState<boolean>(false);

  useEffect(() => {
    if (pastEpochs?.length > 0) {
      setSelectedEpochId(pastEpochs[pastEpochs.length - 1].id);
    }
  }, [pastEpochs]);

  const selectedEpoch = pastEpochs.find((e) => e.id === selectedEpochId);

  return (
    <div className={classes.root}>
      <div className={classes.circleContainer}>
        <p className={classes.circleTitle}>{capitalizedName(circle?.name)}</p>
        <Button
          className={classes.editButton}
          onClick={() => setEditEpoch(true)}
        >
          <Hidden smDown>
            <div className={classes.editAdminIconWrapper}>
              <EditAdminSVG />
            </div>
          </Hidden>
          Edit Epoch Settings
        </Button>
        <Button
          className={classes.editButton}
          onClick={() => {
            setEditCircle(true);
          }}
        >
          <Hidden smDown>
            <div className={classes.editAdminIconWrapper}>
              <EditAdminSVG />
            </div>
          </Hidden>
          Edit Circle Settings
        </Button>
        <div className={classes.csvContainer}>
          {/* <a className={classes.csv} href="/" rel="noreferrer" target="_blank">
            Import Contributors CSV
          </a>
          <a className={classes.csv} href="/" rel="noreferrer" target="_blank">
            Export Contributors CSV
          </a> */}
          <a
            className={classes.csv}
            href={
              circle && selectedEpoch
                ? getCSVPath(circle.id, selectedEpochId)
                : '/'
            }
            rel="noreferrer"
            download={`${circle?.protocol}-${circle?.name}-epoch-${selectedEpoch?.number}.csv`}
          >
            Export CSV for Epoch
          </a>
          <Select
            value={selectedEpochId}
            onChange={({ target: { value } }) =>
              setSelectedEpochId(value as number)
            }
          >
            {pastEpochs.map((epoch) => (
              <MenuItem key={epoch.id} value={epoch.id}>
                {epoch.number}
              </MenuItem>
            ))}
          </Select>
        </div>
      </div>
      <div className={classes.epochContainer}>
        <p className={classes.title}>Next Epoch Starts</p>
        <p className={classes.description}>
          {epochs[0]
            ? moment.utc(epochs[0].start_date).local().format('MMMM Do')
            : 'n/a'}
        </p>
        <p className={classes.title}>Progress Epoch</p>
        <p className={classes.description}>
          {epoch &&
          moment.utc().diff(moment.utc(epoch.start_date)) >= 0 &&
          moment.utc(epoch.end_date).diff(moment.utc()) > 0
            ? `${moment
                .utc(epoch.start_date)
                .local()
                .format('MM/DD/YYYY')} - ${moment
                .utc(epoch.end_date)
                .local()
                .format('MM/DD/YYYY')}`
            : 'n/a'}
        </p>
        {/* <p className={classes.title}>Epoch Length</p>
        <p className={classes.description}>
          {epoch
            ? moment
                .utc(epoch.end_date)
                .diff(moment.utc(epoch.start_date), 'days')
            : 0}{' '}
          Days
        </p> */}
        <p className={classes.title}>Upcoming Epochs</p>
        <p className={classes.description}>
          {epochs.length === 0
            ? 'n/a'
            : epochs.reduce(
                (dateString: string, epoch) =>
                  dateString +
                  (dateString.length === 0 ? '' : '\n') +
                  `${moment
                    .utc(epoch.start_date)
                    .local()
                    .format('MM/DD/YYYY')} - ${moment
                    .utc(epoch.end_date)
                    .local()
                    .format('MM/DD/YYYY')}`,
                ''
              )}
        </p>
      </div>
      <div className={classes.epochContainer}>
        <p className={classes.title}>Teammate selection page text</p>
        <p className={classes.description}>{circle?.team_sel_text}</p>
        <p className={classes.title}>Allocation page text</p>
        <p className={classes.description}>{circle?.alloc_text}</p>
        <p className={classes.title}>Token Name</p>
        <p className={classes.description}>{circle?.token_name}</p>
      </div>
      {isEditCircle && circle && (
        <EditCircleModal
          circle={circle}
          onClose={() => {
            setEditCircle(false);
          }}
          visible={isEditCircle}
        />
      )}
      {isEditEpoch && (
        <EditEpochModal
          onClose={() => {
            setEditEpoch(false);
          }}
          visible={isEditEpoch}
        />
      )}
    </div>
  );
};

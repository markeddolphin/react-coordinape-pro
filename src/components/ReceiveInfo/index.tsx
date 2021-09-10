import React from 'react';

import clsx from 'clsx';
import moment from 'moment';
import { NavLink } from 'react-router-dom';

import { Button, Popover, makeStyles } from '@material-ui/core';

import { Img } from 'components';
import { useMe, useMyPendingGifts } from 'hooks';
import { getHistoryPath } from 'routes/paths';
import { getAvatarPath } from 'utils/domain';

const useStyles = makeStyles((theme) => ({
  root: {
    marginRight: 8,
    alignItems: 'center',
    flex: '1 0 auto',
  },
  receiveButton: {
    padding: '0 15px',
    height: 32,
    fontSize: 12,
    fontWeight: 600,
    color: theme.colors.text,
    background:
      'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(223, 237, 234, 0.4) 40.1%), linear-gradient(180deg, rgba(237, 253, 254, 0.4) 0%, rgba(207, 231, 233, 0) 100%), #FFFFFF',
    borderRadius: 8,
    display: 'flex',
    textTransform: 'none',
    '&.selected': {
      color: theme.colors.selected,
    },
  },
  popover: {
    width: 335,
    maxHeight: 550,
    marginTop: 8,
    padding: '27px 22px',
    overflowY: 'auto',
    borderRadius: 8,
    background:
      'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(223, 237, 234, 0.4) 40.1%), linear-gradient(180deg, rgba(237, 253, 254, 0.4) 0%, rgba(207, 231, 233, 0) 100%), #FFFFFF',
    boxShadow: '0px 4px 6px rgba(181, 193, 199, 0.16)',
  },
  regiftContainer: {
    padding: theme.spacing(2, 3),
    marginBottom: theme.spacing(2),
  },
  regiftTitle: {
    margin: 0,
    padding: 0,
    fontSize: 13,
    fontWeight: 400,
    color: theme.colors.text,
    textAlign: 'center',
    whiteSpace: 'pre-line',
  },
  navLink: {
    fontWeight: 600,
    color: theme.colors.text,
  },
  note: {
    paddingTop: 8,
    border: 'solid',
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  noteHeader: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  noteTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: theme.colors.red,
  },
  noteDate: {
    fontSize: 11,
    fontWeight: 400,
    color: 'rgba(94, 111, 116, 0.6)',
  },
  noteContainer: {
    margin: theme.spacing(0.5, 0),
    display: 'flex',
  },
  avatar: {
    marginRight: theme.spacing(1),
    width: 34,
    height: 34,
    borderRadius: 17,
    fontSize: 12,
    fontWeight: 400,
  },
  noteBody: {
    padding: '10px 0',
    fontSize: 13,
    fontWeight: 400,
    color: 'rgba(0, 0, 0, 0.7)',
  },
  noteEmptyBody: {
    padding: '10px 0',
    fontSize: 13,
    fontWeight: 400,
    color: 'rgba(0, 0, 0, 0.2)',
  },
  historyContainer: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(0, 3),
  },
}));

export const ReceiveInfo = () => {
  const classes = useStyles();
  const { pendingGifts, usersMap } = useMyPendingGifts();
  const { selectedCircle: circle, selectedMyUser: me } = useMe();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'note-popover' : undefined;

  return (
    <div className={classes.root}>
      <Button
        aria-describedby={id}
        className={
          !anchorEl
            ? classes.receiveButton
            : clsx(classes.receiveButton, 'selected')
        }
        onClick={handleClick}
      >
        {me?.give_token_received || 0} {circle?.token_name || 'GIVE'}
      </Button>
      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        classes={{
          paper: classes.popover,
        }}
        id={id}
        onClose={handleClose}
        open={open}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <div className={classes.regiftContainer}>
          <p className={classes.regiftTitle}>
            You will receive {me?.give_token_received ?? 0}{' '}
            {circle?.token_name || 'GIVE'}
          </p>
        </div>
        {pendingGifts
          .filter(
            (tokenGift) => tokenGift.tokens > 0 || tokenGift.note.length > 0
          )
          .sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at))
          .map((tokenGift) => (
            <div className={classes.note} key={tokenGift.id}>
              <div className={classes.noteHeader}>
                <div className={classes.noteTitle}>
                  {tokenGift.tokens > 0
                    ? `+${tokenGift.tokens} Received from `
                    : 'From '}
                  {usersMap.get(tokenGift.sender_id)?.name ?? 'Unknown'}
                </div>
                <div className={classes.noteDate}>
                  {moment(tokenGift.updated_at).format('MMM ‘D')}
                </div>
              </div>
              <div className={classes.noteContainer}>
                <Img
                  alt={usersMap.get(tokenGift.sender_id)?.name ?? 'Unknown'}
                  className={classes.avatar}
                  placeholderImg="/imgs/avatar/placeholder.jpg"
                  src={getAvatarPath(usersMap.get(tokenGift.sender_id)?.avatar)}
                />
                <div
                  className={
                    tokenGift.note.length > 0
                      ? classes.noteBody
                      : classes.noteEmptyBody
                  }
                >
                  {tokenGift.note.length > 0
                    ? `“${tokenGift.note}”`
                    : '-- Empty Note --'}
                </div>
              </div>
            </div>
          ))}
        <div className={classes.historyContainer}>
          <p className={classes.regiftTitle}>
            <NavLink className={classes.navLink} to={getHistoryPath()}>
              See Complete History
            </NavLink>
          </p>
        </div>
      </Popover>
    </div>
  );
};

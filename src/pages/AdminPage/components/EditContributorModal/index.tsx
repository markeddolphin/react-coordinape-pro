import React, { useState } from 'react';

import { ethers } from 'ethers';

import {
  Button,
  Hidden,
  MenuItem,
  Modal,
  Select,
  makeStyles,
} from '@material-ui/core';

import { ReactComponent as SaveAdminSVG } from 'assets/svgs/button/save-admin.svg';
import { useUserInfo } from 'hooks';

import { IUser } from 'types';

const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: theme.spacing(2.5, 6),
    width: 648,
    height: 658,
    borderRadius: theme.spacing(1),
    outline: 'none',
    background: theme.colors.white,
  },
  title: {
    fontSize: 30,
    fontWeight: 700,
    color: theme.colors.text,
    textAlign: 'center',
  },
  subContent: {
    margin: theme.spacing(1, 5),
    display: 'flex',
    flexDirection: 'column',
  },
  subContainer: {
    marginBottom: theme.spacing(1.5),
    display: 'flex',
    justifyContent: 'space-between',
  },
  topContainer: {
    width: '45%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  bottomContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  subTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: theme.colors.text,
    textAlign: 'center',
  },
  input: {
    padding: theme.spacing(1.5),
    fontSize: 15,
    fontWeight: 500,
    color: theme.colors.text,
    background: theme.colors.background,
    borderRadius: theme.spacing(1),
    border: 0,
    outline: 'none',
    textAlign: 'center',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  selectRoot: {
    padding: theme.spacing(0.8),
    justifyContent: 'center',
    fontSize: 15,
    fontWeight: 500,
    color: theme.colors.text,
    background: theme.colors.background,
    borderRadius: theme.spacing(1),
  },
  select: {
    paddingLeft: theme.spacing(10),
  },
  selectIcon: {
    marginRight: theme.spacing(10),
    fill: theme.colors.text,
  },
  menuItem: {
    justifyContent: 'center',
    fontSize: 15,
    fontWeight: 500,
    color: theme.colors.text,
  },
  menuItemSelected: {
    background: `${theme.colors.third} !important`,
  },
  saveButton: {
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: theme.spacing(2),
    padding: theme.spacing(1.5, 3),
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'none',
    color: theme.colors.white,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    background: theme.colors.red,
    borderRadius: theme.spacing(1),
    filter: 'drop-shadow(2px 3px 6px rgba(81, 99, 105, 0.33))',
    '&:hover': {
      background: theme.colors.red,
      filter: 'drop-shadow(2px 3px 6px rgba(81, 99, 105, 0.5))',
    },
    '&:disabled': {
      color: theme.colors.lightRed,
      background: theme.colors.mediumRed,
    },
  },
  saveAdminIconWrapper: {
    width: theme.spacing(1.25),
    height: theme.spacing(2),
    marginRight: theme.spacing(1),
  },
}));

export const EditContributorModal = ({
  onClose,
  user,
  visible,
}: {
  visible: boolean;
  onClose: () => void;
  user?: IUser;
}) => {
  const classes = useStyles();

  const { updateUser, createUser, circle } = useUserInfo();
  const [contributorName, setContributorName] = useState<string>(
    user?.name || ''
  );
  const [contributorNonGive, setContributorNonGive] = useState<number>(
    user?.non_giver || 0
  );
  const [contributorOptOut, setContributorOptOut] = useState<number>(
    user?.fixed_non_receiver || 0
  );
  const [contributorAdmin, setContributorAdmin] = useState<number>(
    user?.role || 0
  );
  const [contributorAddress, setContributorAddress] = useState<string>(
    user?.address || ''
  );
  const [contributorStartingTokens, setStartingTokens] = useState<number>(
    user?.starting_tokens || 100
  );

  // onChange ContributorName
  const onChangeContributorName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContributorName(e.target.value);
  };
  // onChange ContributorAddress
  const onChangeContributorAddress = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setContributorAddress(e.target.value);
  };

  // onClick SaveContributor
  const onClickSaveContributor = async () => {
    await (user
      ? updateUser(user.address, {
          name: contributorName,
          address: contributorAddress,
          non_giver: contributorNonGive,
          fixed_non_receiver: contributorOptOut,
          role: contributorAdmin,
          starting_tokens: contributorStartingTokens,
        })
      : createUser({
          name: contributorName,
          address: contributorAddress,
          non_giver: contributorNonGive,
          fixed_non_receiver: contributorOptOut,
          role: contributorAdmin,
          starting_tokens: contributorStartingTokens,
        }));
  };

  // Return
  return (
    <Modal className={classes.modal} onClose={onClose} open={visible}>
      <div className={classes.content}>
        <p className={classes.title}>{user ? 'Edit' : 'Add'} Contributor</p>
        <div className={classes.subContent}>
          <div className={classes.subContainer}>
            <div className={classes.topContainer}>
              <p className={classes.subTitle}>Contributor Name</p>
              <input
                className={classes.input}
                onChange={onChangeContributorName}
                value={contributorName}
              />
            </div>
            <div className={classes.topContainer}>
              <p className={classes.subTitle}>
                Can They Send {circle?.token_name || 'GIVE'}?
              </p>
              <Select
                className={classes.selectRoot}
                classes={{
                  select: classes.select,
                  icon: classes.selectIcon,
                }}
                disableUnderline
                onChange={({ target: { value } }) =>
                  setContributorNonGive(value as number)
                }
                value={contributorNonGive}
              >
                {[0, 1].map((value) => (
                  <MenuItem
                    className={classes.menuItem}
                    classes={{ selected: classes.menuItemSelected }}
                    key={value}
                    value={value}
                  >
                    {value === 0 ? 'Yes' : 'No'}
                  </MenuItem>
                ))}
              </Select>
            </div>
          </div>
          <div className={classes.subContainer}>
            <div className={classes.topContainer}>
              <p className={classes.subTitle}>Force Opt Out?</p>
              <Select
                className={classes.selectRoot}
                classes={{
                  select: classes.select,
                  icon: classes.selectIcon,
                }}
                disableUnderline
                onChange={({ target: { value } }) =>
                  setContributorOptOut(value as number)
                }
                value={contributorOptOut}
              >
                {[1, 0].map((value) => (
                  <MenuItem
                    className={classes.menuItem}
                    classes={{ selected: classes.menuItemSelected }}
                    key={value}
                    value={value}
                  >
                    {value === 1 ? 'Yes' : 'No'}
                  </MenuItem>
                ))}
              </Select>
            </div>
            <div className={classes.topContainer}>
              <p className={classes.subTitle}>Are They Admin?</p>
              <Select
                className={classes.selectRoot}
                classes={{
                  select: classes.select,
                  icon: classes.selectIcon,
                }}
                disableUnderline
                onChange={({ target: { value } }) =>
                  setContributorAdmin(value as number)
                }
                value={contributorAdmin}
              >
                {[1, 0].map((value) => (
                  <MenuItem
                    className={classes.menuItem}
                    classes={{ selected: classes.menuItemSelected }}
                    key={value}
                    value={value}
                  >
                    {value === 1 ? 'Yes' : 'No'}
                  </MenuItem>
                ))}
              </Select>
            </div>
          </div>
          <div className={classes.subContainer}>
            <div className={classes.topContainer}>
              <p className={classes.subTitle}>Starting Tokens</p>
              <input
                className={classes.input}
                onChange={({ target: { value } }) =>
                  setStartingTokens(value ? parseInt(value) : 100)
                }
                value={contributorStartingTokens}
              />
            </div>
          </div>
          <div className={classes.bottomContainer}>
            <p className={classes.subTitle}>Contributor ETH address</p>
            <input
              className={classes.input}
              onChange={onChangeContributorAddress}
              value={contributorAddress}
            />
          </div>
        </div>
        <Button
          className={classes.saveButton}
          disabled={
            contributorName.length === 0 ||
            contributorAddress.length === 0 ||
            !ethers.utils.isAddress(contributorAddress)
          }
          onClick={onClickSaveContributor}
        >
          <Hidden smDown>
            <div className={classes.saveAdminIconWrapper}>
              <SaveAdminSVG />
            </div>
          </Hidden>
          Save
        </Button>
      </div>
    </Modal>
  );
};

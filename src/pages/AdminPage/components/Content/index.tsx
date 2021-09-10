import React, { useEffect, useState } from 'react';

import clsx from 'clsx';

import { Button, makeStyles } from '@material-ui/core';
import { Pagination } from '@material-ui/lab';

import { EditContributorModal } from '../EditContributorModal';
import { ReactComponent as AddContributorSVG } from 'assets/svgs/button/add-contributor.svg';
import { ReactComponent as DeleteContributor } from 'assets/svgs/button/delete-contributor.svg';
import { ReactComponent as EditContributor } from 'assets/svgs/button/edit-contributor.svg';
import { Img } from 'components';
import { useUserInfo } from 'hooks';
import { shortenAddress } from 'utils';
import { getAvatarPath } from 'utils/domain';

import { IUser, ICircle } from 'types';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
  },
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: theme.colors.text,
  },
  accContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    margin: theme.spacing(0, 1),
    padding: theme.spacing(1),
    fontSize: 14,
    fontWeight: 500,
    textAlign: 'center',
    color: theme.colors.text,
    background: 'rgba(225, 225, 225, 0.3)',
    border: 'none',
    borderRadius: 8,
    outline: 'none',
    '&::placeholder': {
      color: theme.colors.text,
      opacity: 0.35,
    },
  },
  addButton: {
    padding: theme.spacing(0.7, 2),
    fontSize: 12,
    fontWeight: 600,
    color: theme.colors.white,
    textTransform: 'none',
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
  },
  addContributorIconWrapper: {
    width: theme.spacing(1.25),
    height: theme.spacing(2.2),
    marginRight: theme.spacing(1.5),
  },
  tableContainer: {
    display: 'flex',
    flexDirection: 'column',
    background: theme.colors.white,
    filter: 'drop-shadow(2px 3px 6px rgba(81, 99, 105, 0.33))',
    borderRadius: theme.spacing(0.5),
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    position: 'relative',
  },
  one: {
    width: '20%',
  },
  two: {
    width: '11.6%',
  },
  three: {
    width: '5%',
  },
  trHeader: {
    height: 60,
  },
  th: {
    fontSize: 14,
    fontWeight: 700,
    color: theme.colors.text,
    background: theme.colors.background,
    backdropFilter: 'blur(5px)',
    position: 'sticky',
    top: 0,
    boxShadow: '0 1px 0 0 rgba(81, 99, 105, 0.2)',
    zIndex: 1,
    '&.left': {
      paddingLeft: theme.spacing(4),
      textAlign: 'left',
    },
  },
  trBody: {
    height: 56,
    border: 'solid',
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: theme.colors.border,
  },
  tdContributor: {
    fontSize: 14,
    fontWeight: 400,
    color: theme.colors.text,
    padding: '0px 25px',
  },
  contributorContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    marginRight: 16,
    borderRadius: 16,
    fontSize: 12,
    fontWeight: 400,
  },
  tdOther: {
    fontSize: 14,
    fontWeight: 400,
    color: theme.colors.text,
    textAlign: 'center',
  },
  tdButton: {
    padding: 0,
  },
  pagination: {
    margin: theme.spacing(2, 0),
  },
}));

export const Content = () => {
  const classes = useStyles();

  const { circle, deleteUser, me, availableTeammates } = useUserInfo();
  const [keyword, setKeyword] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [filterUsers, setFilterUsers] = useState<IUser[]>([]);
  const [editContributor, setEditContributor] = useState<{
    isEdit: boolean;
    user: IUser | undefined;
  }>({ isEdit: false, user: undefined });
  const [order, setOrder] = useState<{ field: number; ascending: number }>({
    field: 0,
    ascending: 1,
  });

  const pageCount = 10;

  useEffect(() => {
    // Filter
    const key = keyword.toLowerCase();
    setFilterUsers(
      (me ? [...availableTeammates, me] : availableTeammates).filter(
        (user) =>
          user.name.toLowerCase().includes(key) ||
          user.address.toLowerCase().includes(key) ||
          String(user.starting_tokens - user.give_token_remaining).includes(
            key
          ) ||
          String(user.give_token_received).includes(key)
      )
    );
  }, [keyword, me, availableTeammates]);

  // onChangeKeyword
  const onChangeKeyword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
    setPage(1);
  };

  // OnClick Sort
  const onClickSort = (field: number) => {
    if (order.field !== field) {
      setOrder({ field: field, ascending: 1 });
    } else {
      setOrder({ field: field, ascending: -order.ascending });
    }
  };

  // onClick DeleteUser
  const onClickDeleteUser = async (user: IUser) => deleteUser(user.address);

  // onClick Page
  const onClickPage = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // <Return>
  return (
    <div className={classes.root}>
      <div className={classes.headerContainer}>
        <p className={classes.title}>Circle Members</p>
        <div className={classes.accContainer}>
          <input
            className={classes.searchInput}
            onChange={onChangeKeyword}
            placeholder="🔍 Search"
            value={keyword}
          />
          <Button
            className={classes.addButton}
            onClick={() => {
              setEditContributor({ isEdit: true, user: undefined });
            }}
          >
            <div className={classes.addContributorIconWrapper}>
              <AddContributorSVG />
            </div>
            Add Contributor
          </Button>
        </div>
      </div>
      <div className={classes.tableContainer}>
        <table className={classes.table}>
          <colgroup>
            <col className={classes.one} />
            <col className={classes.two} />
            <col className={classes.two} />
            <col className={classes.two} />
            <col className={classes.two} />
            <col className={classes.two} />
            <col className={classes.two} />
            <col className={classes.three} />
            <col className={classes.three} />
          </colgroup>
          <thead>
            <tr className={classes.trHeader}>
              <th
                className={clsx(classes.th, 'left')}
                onClick={() => onClickSort(0)}
              >
                Name
                {order.field === 0 ? (order.ascending > 0 ? ' ↓' : ' ↑') : ''}
              </th>
              <th className={classes.th} onClick={() => onClickSort(1)}>
                ETH Wallet
                {order.field === 1 ? (order.ascending > 0 ? ' ↓' : ' ↑') : ''}
              </th>
              <th className={classes.th} onClick={() => onClickSort(2)}>
                Can they give?
                {order.field === 2 ? (order.ascending > 0 ? ' ↓' : ' ↑') : ''}
              </th>
              <th className={classes.th} onClick={() => onClickSort(6)}>
                Force Opt Out?
                {order.field === 6 ? (order.ascending > 0 ? ' ↓' : ' ↑') : ''}
              </th>
              <th className={classes.th} onClick={() => onClickSort(3)}>
                Are they admin?
                {order.field === 3 ? (order.ascending > 0 ? ' ↓' : ' ↑') : ''}
              </th>
              <th className={classes.th} onClick={() => onClickSort(4)}>
                {circle?.token_name || 'GIVE'} sent
                {order.field === 4 ? (order.ascending > 0 ? ' ↓' : ' ↑') : ''}
              </th>
              <th className={classes.th} onClick={() => onClickSort(5)}>
                {circle?.token_name || 'GIVE'} received
                {order.field === 5 ? (order.ascending > 0 ? ' ↓' : ' ↑') : ''}
              </th>
              <th className={classes.th}>Edit</th>
              <th className={classes.th}>Delete</th>
            </tr>
          </thead>
          <tbody>
            {filterUsers
              .sort((a, b) => {
                switch (order.field) {
                  case 0:
                    return order.ascending * a.name.localeCompare(b.name);
                  case 1:
                    return order.ascending * a.address.localeCompare(b.address);
                  case 2:
                    return order.ascending * (a.non_giver - b.non_giver);
                  case 3:
                    return order.ascending * (a.role - b.role);
                  case 4:
                    return (
                      order.ascending *
                      (b.give_token_remaining - a.give_token_remaining)
                    );
                  case 5:
                    return (
                      order.ascending *
                      (a.give_token_received - b.give_token_received)
                    );
                  case 6:
                    return (
                      order.ascending *
                      (b.fixed_non_receiver - a.fixed_non_receiver)
                    );
                  default:
                    return order.ascending;
                }
              })
              .slice(
                (page - 1) * pageCount,
                Math.min(page * pageCount, filterUsers.length)
              )
              .map((user) => (
                <tr className={classes.trBody} key={user.id}>
                  <td className={classes.tdContributor}>
                    <div className={classes.contributorContainer}>
                      <Img
                        alt={user.name}
                        className={classes.avatar}
                        placeholderImg="/imgs/avatar/placeholder.jpg"
                        src={getAvatarPath(user.avatar)}
                      />
                      {user.name}
                    </div>
                  </td>
                  <td className={classes.tdOther}>
                    {shortenAddress(user.address)}
                  </td>
                  <td className={classes.tdOther}>
                    {user.non_giver === 0 ? 'Yes' : 'No'}
                  </td>
                  <td className={classes.tdOther}>
                    {user.fixed_non_receiver === 0 ? 'No' : 'Yes'}
                  </td>
                  <td className={classes.tdOther}>
                    {user.role === 0 ? 'No' : 'Yes'}
                  </td>
                  <td className={classes.tdOther}>
                    {user.starting_tokens - user.give_token_remaining}
                  </td>
                  <td className={classes.tdOther}>
                    {user.give_token_received}
                  </td>
                  <td className={classes.tdOther}>
                    <Button
                      onClick={() => {
                        setEditContributor({ isEdit: true, user: user });
                      }}
                    >
                      <EditContributor />
                    </Button>
                  </td>
                  <td className={classes.tdOther}>
                    {user.id !== me?.id && (
                      <Button
                        onClick={() => {
                          onClickDeleteUser(user);
                        }}
                      >
                        <DeleteContributor />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <Pagination
          className={classes.pagination}
          color="secondary"
          count={Math.ceil(filterUsers.length / pageCount)}
          onChange={onClickPage}
          page={page}
          shape="rounded"
          variant="outlined"
        />
      </div>
      {editContributor.isEdit && (
        <EditContributorModal
          onClose={() => {
            setEditContributor({ isEdit: false, user: undefined });
          }}
          user={editContributor.user}
          visible={editContributor.isEdit}
        />
      )}
    </div>
  );
};

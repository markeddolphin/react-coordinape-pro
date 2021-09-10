import React, { Suspense } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';

import { makeStyles } from '@material-ui/core';

import { rMyAddress, rCircleSelectorOpen, rSelectedCircle } from 'recoilState';
import { getNavigationFooter } from 'routes/paths';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  header: {
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingTop: 70,
    maxWidth: '60%',
    textAlign: 'center',
  },
  title: {
    fontSize: 54,
    fontWeight: 700,
    color: theme.colors.primary,
    margin: 0,
  },
  subTitle: {
    margin: 0,
    padding: theme.spacing(0, 5),
    fontSize: 30,
    fontWeight: 400,
    color: theme.colors.primary,
  },
  subTitleLink: {
    fontSize: 30,
    fontWeight: 400,
    color: theme.colors.primary,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
    display: 'inline',
    margin: 0,
    padding: theme.spacing(0, 5),
  },

  skeletonRoot: {
    marginTop: 60,
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingTop: 48,
    paddingLeft: 114,
    paddingRight: 114,
    paddingBottom: 32,
    width: '80%',
    height: '100%',
    background: '#DFE7E8',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
  },
  skeletonHeader: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  skeletonSubHeader: {
    width: '18%',
    height: 23,
    background: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 8,
  },
  skeletonBody: {
    paddingTop: 16,
    paddingBottom: 16,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  skeletonSubBody: {
    height: 46,
    background: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 8,
  },
  footer: {
    display: 'grid',
    gridTemplateColumns: '1fr 150px 150px 150px 150px 1fr',
    padding: theme.spacing(8, 8),
    justifyContent: 'center',
    '& > *': {
      textAlign: 'center',
    },
  },
  link: {
    position: 'relative',
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: 600,
    textDecoration: 'none',
    '&::after': {
      content: `" "`,
      position: 'absolute',
      left: '50%',
      right: '50%',
      backgroundColor: theme.colors.primary,
      transition: 'all 0.3s',
      bottom: 0,
      height: 2,
    },
    '&:hover': {
      '&::after': {
        left: 0,
        right: 0,
        backgroundColor: theme.colors.primary,
      },
    },
  },
}));

const Welcome = () => {
  const classes = useStyles();

  const selectedCircle = useRecoilValue(rSelectedCircle);
  const setCircleSelectorOpen = useSetRecoilState(rCircleSelectorOpen);

  return (
    <>
      <p className={classes.title}>
        {selectedCircle === undefined
          ? 'Welcome!'
          : `Welcome to ${selectedCircle.name}!`}
      </p>
      {selectedCircle === undefined ? (
        <button
          className={classes.subTitleLink}
          onClick={() => setCircleSelectorOpen(true)}
        >
          Select a circle to begin
        </button>
      ) : null}
    </>
  );
};

const Generic = () => {
  const classes = useStyles();

  return (
    <>
      <p className={classes.title}>Reward Your Fellow Contributors</p>
      <p className={classes.subTitle}>
        Connect your wallet to participate. You must be registered as a
        contributor with an existing Coordinape project
      </p>
    </>
  );
};

const PreconnectHeader = () => {
  const classes = useStyles();
  const myAddress = useRecoilValue(rMyAddress);

  return (
    <div className={classes.header}>
      {myAddress ? (
        <Suspense fallback={<Generic />}>
          <Welcome />
        </Suspense>
      ) : (
        <Generic />
      )}
    </div>
  );
};

const SkeletonBody = () => {
  const classes = useStyles();
  const selectedCircle = useRecoilValue(rSelectedCircle);
  const myAddress = useRecoilValue(rMyAddress);

  return !!myAddress && !selectedCircle ? (
    <div></div>
  ) : (
    <div className={classes.skeletonRoot}>
      <div className={classes.skeletonHeader}>
        <div className={classes.skeletonSubHeader} />
        <div className={classes.skeletonSubHeader} />
        <div className={classes.skeletonSubHeader} />
        <div className={classes.skeletonSubHeader} />
      </div>
      <div className={classes.skeletonBody}>
        <div className={classes.skeletonSubBody} />
        <div className={classes.skeletonSubBody} />
        <div className={classes.skeletonSubBody} />
        <div className={classes.skeletonSubBody} />
      </div>
    </div>
  );
};

export const PreconnectPage = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <PreconnectHeader />
      <SkeletonBody />
      <div className={classes.footer}>
        <div />
        {getNavigationFooter().map(({ path, label }) => (
          <div key={path}>
            <a
              className={classes.link}
              href={path}
              rel="noreferrer"
              target="_blank"
            >
              {label}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreconnectPage;

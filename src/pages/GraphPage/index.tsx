import React, { useCallback, useEffect, useRef, useState } from 'react';

import { forceLink } from 'd3-force-3d';
import fromPairs from 'lodash/fromPairs';
import uniq from 'lodash/uniq';
import ForceGraph2D from 'react-force-graph-2d';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useRecoilValue } from 'recoil';

import { MenuItem, Select, makeStyles } from '@material-ui/core';

import { useUserInfo, useSelectedCircleEpoch } from 'hooks';
import { rGifts, rPendingGifts } from 'recoilState';
import { getAvatarPath } from 'utils/domain';
import { labelEpoch } from 'utils/tools';

import FilterDrawer from './FilterDrawer';

import { IGraphLink, IGraphNode, ITokenGift, IUser, IEpochOption } from 'types';

const NODE_R = 8;
const FAKE_ALL_EPOCH = -1;

// TODO: XSS vulnerability on node labels:
// https://github.com/vasturiano/force-graph/issues/20

// TODO: Move to theme
const COLOR_NODE_HIGHLIGHT = '#13a2cc';
const COLOR_GIVE = '#00ce2c';
const COLOR_RECEIVE = '#d3860d';
const COLOR_CIRCULATE = '#c9b508';
const COLOR_NODE = '#000000';
const COLOR_NODE_FADE = '#EE5555';
const COLOR_GIVE_LINK = '#00ce2c80';
const COLOR_RECEIVE_LINK = '#d3860d80';
const COLOR_LINK = '#00000010';
const COLOR_LINK_DIM = '#00000004';

const showMagnitudes = () => true;

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    height: '100%',
  },
  autoSizer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  controls: {
    padding: theme.spacing(2, 4),
    position: 'absolute',
    top: 0,
    right: 0,
    width: 300,
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  epochSelectRoot: {
    fontSize: 16,
    fontWeight: 700,
    color: theme.colors.red,
    '&:hover': {
      '&::before': {
        borderBottomColor: `${theme.colors.red} !important`,
      },
    },
    '&::after': {
      borderBottomColor: `${theme.colors.transparent} !important`,
    },
  },
  epochSelect: {
    color: theme.colors.red,
  },
  epochSelectIcon: {
    fill: theme.colors.red,
  },
  epochSelectMenuPaper: {
    background:
      'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(223, 237, 234, 0.4) 40.1%), linear-gradient(180deg, rgba(237, 253, 254, 0.4) 0%, rgba(207, 231, 233, 0) 100%), #FFFFFF',
  },
  epochMenuItem: {
    fontSize: 18,
    fontWeight: 500,
    color: theme.colors.text,
  },
  epochMenuItemSelected: {
    background: `${theme.colors.third} !important`,
  },
}));

function linkStrengthToken(link: any) {
  return 0.05 / link.tokens;
}

function linkStrengthCounts(link: any) {
  return 0.5 / (link.source.linkCount + link.target.linkCount);
}

const GraphPage = () => {
  const fgRef = useRef<any>(null);
  const hoverNode = useRef<IGraphNode | undefined>(undefined);
  const highlightReceiveNodes = useRef<Set<IGraphNode>>(new Set());
  const highlightGiveNodes = useRef<Set<IGraphNode>>(new Set());
  const highlightReceiveLinks = useRef<Set<IGraphLink>>(new Set());
  const highlightGiveLinks = useRef<Set<IGraphLink>>(new Set());

  // A duplicate of filteredUsers
  const filteredUserSet = useRef<Set<IGraphNode>>(new Set());

  const classes = useStyles();
  const pastGifts = useRecoilValue(rGifts);
  const pendingGifts = useRecoilValue(rPendingGifts);

  const [gifts, setGifts] = useState<ITokenGift[]>([]);
  const [links, setLinks] = useState<IGraphLink[]>([]);
  const [nodes, setNodes] = useState<IGraphNode[]>([]);
  const [epochOptions, setEpochOptions] = useState<IEpochOption[]>([]);
  const [epochSelection, setEpochSelection] = useState<number>(0);
  const [filteredUsers, setFilteredUsers] = useState<IGraphNode[]>([]);
  const [userRegExp, setUserRegExp] = useState<RegExp | undefined>();

  // TODO: this seems redundant with hoverNode
  const [selectedNode, setSelectedNode] = useState<IGraphNode | undefined>();

  const {
    epochIsActive,
    currentEpoch,
    pastEpochs,
    circleId: selectedCircleId,
  } = useSelectedCircleEpoch();
  const { allUsers } = useUserInfo();

  const handleSearchChange = (_event: any, value: string) => {
    if (!value) {
      setUserRegExp(undefined);
      setFilteredUsers([]);
      filteredUserSet.current = new Set();
      return;
    }
    let regExp: RegExp | undefined;
    try {
      regExp = new RegExp(
        `(${value.replace(/[#-.]|[[-^]|[?{}]/g, '\\$&')})`,
        'i'
      );
    } catch (error) {
      console.warn(error);
      return;
    }
    setUserRegExp(regExp);
    const filtered = nodes.filter((u) =>
      (regExp as RegExp).test(`${u.name} ${u.bio}`)
    );
    setFilteredUsers(filtered);
    filteredUserSet.current = new Set(filtered);
  };

  const configureForces = () => {
    const fl = forceLink().strength(
      showMagnitudes() ? linkStrengthToken : linkStrengthCounts
    );
    fgRef.current.d3Force('link', fl);
  };

  const nodeCanvasObject = useCallback((node: any, ctx: any) => {
    const centX = node.x;
    const centY = node.y;
    let strokeColor = COLOR_NODE;
    if (filteredUserSet.current.size) {
      strokeColor = filteredUserSet.current.has(node)
        ? COLOR_NODE_FADE
        : COLOR_NODE;
    }
    const width = showMagnitudes()
      ? Math.min(Math.max(1.2, node.tokensReceived / 50), 6)
      : 1;
    if (node === hoverNode.current) strokeColor = COLOR_NODE_HIGHLIGHT;
    if (highlightGiveNodes.current.has(node)) strokeColor = COLOR_GIVE;
    if (highlightReceiveNodes.current.has(node)) strokeColor = COLOR_RECEIVE;
    if (
      highlightReceiveNodes.current.has(node) &&
      highlightGiveNodes.current.has(node)
    )
      strokeColor = COLOR_CIRCULATE;

    ctx.beginPath();
    ctx.arc(node.x, node.y, NODE_R + 0.5 * width, 0, 2 * Math.PI);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.closePath();

    ctx.save();
    ctx.beginPath();
    ctx.arc(node.x, node.y, NODE_R, 0, 2 * Math.PI);
    ctx.fillStyle = COLOR_NODE;
    ctx.fill();
    ctx.clip();

    try {
      ctx.drawImage(
        node.img,
        centX - NODE_R,
        centY - NODE_R,
        NODE_R * 2,
        NODE_R * 2
      );
    } catch (error) {
      // console.error(node.avatar);
    }
    ctx.restore();
  }, []);

  const linkColor = useCallback((link: any) => {
    let color = hoverNode.current ? COLOR_LINK_DIM : COLOR_LINK;
    if (highlightReceiveLinks.current.has(link)) color = COLOR_RECEIVE_LINK;
    if (highlightGiveLinks.current.has(link)) color = COLOR_GIVE_LINK;
    return color;
  }, []);

  const linkDirectionalParticleWidth = useCallback(
    (link: IGraphLink) => {
      if (
        highlightReceiveLinks.current.has(link) ||
        highlightGiveLinks.current.has(link)
      ) {
        return showMagnitudes() ? Math.max(link.tokens / 10, 3) : 4;
      }
      return 0;
    },
    [epochSelection]
  );

  const getWidth = (link: IGraphLink) => (showMagnitudes() ? link.width : 4);

  // TODO: Clear Filters?
  // const onPanelClose = () => {
  //   hoverNode.current = undefined;
  //   setSelectedNode(undefined);
  //   setFilteredUsers([]);
  //   setUserRegExp(undefined);
  //   filteredUserSet.current = new Set([]);
  // };

  const onNodeClick = useCallback(
    (node: any) => {
      highlightReceiveNodes.current.clear();
      highlightGiveNodes.current.clear();
      highlightReceiveLinks.current.clear();
      highlightGiveLinks.current.clear();
      if (node === hoverNode.current) {
        hoverNode.current = undefined;
        setSelectedNode(undefined);
        !userRegExp && setFilteredUsers([]);
        return;
      }
      if (node) {
        node.receivers.forEach((other: IGraphNode) =>
          highlightReceiveNodes.current.add(other)
        );
        node.givers.forEach((other: IGraphNode) =>
          highlightGiveNodes.current.add(other)
        );
        node.giverLinks.forEach((l: IGraphLink) =>
          highlightGiveLinks.current.add(l)
        );
        node.receiverLinks.forEach((l: IGraphLink) =>
          highlightReceiveLinks.current.add(l)
        );
        hoverNode.current = node;
        setSelectedNode(node);
        !userRegExp && setFilteredUsers([node]);
      }
    },
    [userRegExp]
  );

  useEffect(() => {
    if (pastEpochs.length === 0) {
      setEpochOptions([]);
      setEpochSelection(0);
      return;
    }

    const options = [
      {
        label: 'ALL',
        value: FAKE_ALL_EPOCH,
      },
    ].concat(
      pastEpochs.map((e) => ({
        label: labelEpoch(e),
        value: e.id,
      }))
    );
    if (currentEpoch && epochIsActive) {
      setEpochOptions(
        options.concat({
          label: labelEpoch(currentEpoch),
          value: currentEpoch?.id,
        })
      );
      setEpochSelection(currentEpoch.id);
    } else {
      setEpochOptions(options);
      setEpochSelection(pastEpochs[pastEpochs.length - 1].id);
    }
  }, [currentEpoch, pastEpochs]);

  useEffect(() => {
    const allGifts = pastGifts.concat(pendingGifts);
    // TODO: until recently, pending gifts are missing epoch_id
    if (epochSelection === FAKE_ALL_EPOCH) {
      setGifts(allGifts.filter((g) => g.circle_id === selectedCircleId));
      return;
    }

    setGifts(allGifts.filter((g) => g.epoch_id === epochSelection));

    // Set magnitudes here if desired
  }, [epochSelection, pastGifts, pendingGifts, currentEpoch]);

  useEffect(() => {
    if (!fgRef.current) {
      return;
    }

    if (gifts.length === 0 || allUsers.length === 0) {
      setLinks([]);
      setNodes([]);
      return;
    }

    const activeUsers = new Set(
      gifts.flatMap(({ recipient_id, sender_id, tokens }) =>
        tokens > 0 ? [sender_id, recipient_id] : []
      )
    );

    // TODO: This can be simplified for placeholders
    const images = fromPairs(
      uniq(allUsers.map((u) => u.avatar)).map((avatar) => {
        const img = new Image();
        img.src = getAvatarPath(avatar);
        return [avatar ?? '/imgs/avatar/placeholder.jpg', img];
      })
    );

    const visibleNodes: IGraphNode[] = allUsers
      .filter((u) => activeUsers.has(u.id))
      .map((u) => ({
        ...u,
        img: images[u.avatar ?? '/imgs/avatar/placeholder.jpg'],
        receiverLinks: [] as any,
        giverLinks: [] as any,
        givers: [] as any,
        receivers: [] as any,
        tokensReceived: 0,
        linkCount: 0,
      }));

    if (visibleNodes.length === 0) {
      setLinks([]);
      setNodes([]);
      return;
    }

    const userByAddr: { [key: string]: IUser } = {};
    const userById: { [key: number]: IUser } = {};
    const orderedIdByAddr: { [key: string]: number } = {};
    const orderedId: { [key: number]: number } = {};
    const names: string[] = [];
    const matrix: number[][] = [];

    for (let i = 0; i < visibleNodes.length; i++) {
      const user = visibleNodes[i];
      userByAddr[user.address] = user;
      userById[user.id] = user;
      orderedIdByAddr[user.address] = i;
      orderedId[user.id] = i;
      names[i] = user.name.replace(/\([^)]*\)/, '');
    }

    for (let i = 0; i < visibleNodes.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < visibleNodes.length; j++) {
        matrix[i][j] = 0;
      }
    }

    for (const { recipient_id, sender_id, tokens } of gifts) {
      if (tokens > 0) {
        matrix[orderedId[sender_id]][orderedId[recipient_id]] = tokens;
      }
    }

    // Using the DB id for links, rather than orderedId
    const links: IGraphLink[] = gifts
      .filter(({ tokens }) => tokens > 0)
      .map(({ recipient_id, sender_id, tokens }) => ({
        source: sender_id,
        target: recipient_id,
        width: tokens / 3,
        tokens,
        curvature:
          matrix[orderedId[recipient_id]][orderedId[sender_id]] > 0 ? 0.1 : 0,
      }));

    for (let i = 0; i < visibleNodes.length; i++) {
      const thee = visibleNodes[i];
      // Giving to thee
      thee.giverLinks = links.filter((link) => link.target === thee.id);
      thee.givers = thee.giverLinks.map((l: IGraphLink) => userById[l.source]);
      // Receiving from thee
      thee.receiverLinks = links.filter((link) => link.source === thee.id);
      thee.receivers = thee.receiverLinks.map(
        (l: IGraphLink) => userById[l.target]
      );
      ////
      thee.linkCount = thee.giverLinks.length + thee.receiverLinks.length;
      thee.tokensReceived = thee.giverLinks.reduce(
        (c: number, l: IGraphLink) => c + l.tokens,
        0
      );
    }

    configureForces();
    setLinks(links);
    setNodes(visibleNodes);
  }, [gifts, allUsers]);

  return (
    <div className={classes.root}>
      <FilterDrawer
        onClickUser={onNodeClick}
        regExp={userRegExp}
        selectedUser={selectedNode}
        filteredUsers={filteredUsers}
        users={nodes}
        onSearchChange={handleSearchChange}
      />
      <AutoSizer className={classes.autoSizer}>
        {({ height, width }) => (
          <ForceGraph2D
            graphData={{ nodes, links }}
            height={height}
            linkColor={linkColor}
            linkCurvature="curvature"
            linkDirectionalParticleWidth={
              linkDirectionalParticleWidth as (l: any) => number
            }
            linkDirectionalParticles={4}
            linkWidth={getWidth as (l: any) => number}
            nodeCanvasObject={nodeCanvasObject}
            nodeRelSize={NODE_R}
            onNodeClick={onNodeClick}
            ref={fgRef}
            width={width}
          />
        )}
      </AutoSizer>
      <div className={classes.controls}>
        <Select
          MenuProps={{
            classes: {
              paper: classes.epochSelectMenuPaper,
            },
          }}
          className={classes.epochSelectRoot}
          classes={{
            select: classes.epochSelect,
            icon: classes.epochSelectIcon,
          }}
          onChange={({ target: { value } }) =>
            setEpochSelection(value as number)
          }
          value={epochSelection}
        >
          {Object.values(epochOptions).map(({ label, value }) => (
            <MenuItem
              className={classes.epochMenuItem}
              classes={{ selected: classes.epochMenuItemSelected }}
              key={value}
              value={value}
            >
              {label}
            </MenuItem>
          ))}
        </Select>
      </div>
    </div>
  );
};

export default GraphPage;

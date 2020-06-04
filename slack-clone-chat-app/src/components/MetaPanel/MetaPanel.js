import React, { useState, useContext, useEffect } from "react";
import Store from "../../Store";
import {
  Header,
  Segment,
  Accordion,
  Icon,
  Image,
  List
} from "semantic-ui-react";

export default function MetaPanel() {
  const { state } = useContext(Store);
  const [activeIndex, setActiveIndex] = useState(0);
  const channel = state.channel.currentChannel;
  const isPrivateChannel = state.channel.isPrivateChannel;
  const userPosts = state.channel.userPosts;

  const handleActiveIndexClick = (event, titleProps) => {
    const { index } = titleProps;
    const newIndex = activeIndex === index ? -1 : index;
    setActiveIndex(newIndex);
  };

  const formatCount = num =>
    num > 1 || num === 0 ? `${num} posts` : `${num} post`;

  const displayTopPosters = posts => {
    return Object.entries(posts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([key, val], i) => (
        <List.Item key={i}>
          <Image avatar src={val.avatar} />
          <List.Content>
            <List.Header as="a">{key}</List.Header>
            <List.Description>{formatCount(val.count)}</List.Description>
          </List.Content>
        </List.Item>
      ));
  };

  if (isPrivateChannel) return null;

  return (
    <Segment loading={!channel}>
      <Header as="h3" attached="top">
        About # {channel && channel.name}
      </Header>
      <Accordion styled attached="true">
        <Accordion.Title
          active={activeIndex === 0}
          index={0}
          onClick={handleActiveIndexClick}
        >
          <Icon name="dropdown" />
          <Icon name="info" />
          Channel Details
        </Accordion.Title>
        <Accordion.Content active={activeIndex === 0}>
          {channel && channel.details}
        </Accordion.Content>

        <Accordion.Title
          active={activeIndex === 1}
          index={1}
          onClick={handleActiveIndexClick}
        >
          <Icon name="dropdown" />
          <Icon name="user circle" />
          Top Posters
        </Accordion.Title>
        <Accordion.Content active={activeIndex === 1}>
          <List>{userPosts && displayTopPosters(userPosts)}</List>
        </Accordion.Content>

        <Accordion.Title
          active={activeIndex === 2}
          index={2}
          onClick={handleActiveIndexClick}
        >
          <Icon name="dropdown" />
          <Icon name="pencil alternate" />
          Created By
        </Accordion.Title>
        <Accordion.Content active={activeIndex === 2}>
          <Header as="h3">
            <Image circular src={channel && channel.createdBy.avatar} />
            {channel && channel.createdBy.name}
          </Header>
        </Accordion.Content>
      </Accordion>
    </Segment>
  );
}

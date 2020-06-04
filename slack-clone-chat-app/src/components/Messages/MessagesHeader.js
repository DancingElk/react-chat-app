import React from "react";
import { Header, Segment, Input, Icon } from "semantic-ui-react";

export default function MessagesHeader({
  channelName,
  numUniqueUsers,
  handleSearchChange,
  searchLoading,
  isPrivateChannel,
  handleStar,
  isChannelStarred
}) {
  return (
    <Segment clearing>
      {/* channel title */}
      <Header fluid="true" as="h2" floated="left" style={{ marginBottom: 0 }}>
        <span>
          {channelName}
          {!isPrivateChannel && (
            <Icon
              link
              onClick={handleStar}
              name={isChannelStarred ? "star" : "star outline"}
              color={isChannelStarred ? "yellow" : "black"}
            />
          )}
        </span>
        <Header.Subheader>{numUniqueUsers}</Header.Subheader>
      </Header>
      {/* channel search input */}
      <Header floated="right">
        <Input
          loading={searchLoading}
          size="mini"
          icon="search"
          name="searchTerm"
          placeholder="search Messages"
          onChange={handleSearchChange}
        />
      </Header>
    </Segment>
  );
}

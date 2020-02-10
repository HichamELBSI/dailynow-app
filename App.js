import React, { useEffect, useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator
} from "react-native";
import moment from "moment";
import * as WebBrowser from "expo-web-browser";

const App = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchDailtNow();
  }, [page]);

  const fetchDailtNow = async () => {
    const res = await fetch(
      `https://app.dailynow.co/graphql?query=query+fetchLatest($params:+QueryPostInput)+%7B+latest(params:+$params)+%7B+id,title,url,publishedAt,createdAt,image,ratio,placeholder,views,readTime,publication+%7B+id,+name,+image+%7D,tags+%7D+%7D&variables=%7B%22params%22:%7B%22latest%22:%222020-02-09T22:37:54.625Z%22,%22page%22:${page},%22pageSize%22:30,%22pubs%22:%22%22,%22tags%22:%22javascript,development,startup,tech,react,react-native,react-hook,nodejs,graphql,typescript%22,%22sortBy%22:%22popularity%22%7D%7D`
    );
    const data = await res.json();
    if (page === 0) {
      setData(data.data.latest);
    } else if (page > 0) {
      setData(latest => [...latest, ...data.data.latest]);
    }
    setRefreshing(false);
    setLoadingMore(false);
  };

  const openPost = async link => {
    await WebBrowser.openBrowserAsync(link);
  };

  const handleRefresh = () => {
    setPage(0);
    setRefreshing(true);
    fetchDailtNow();
  };

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View
        style={{
          position: "relative",
          width: "100%",
          height: 100,
          marginTop: 10,
          marginBottom: 10
        }}
      >
        <ActivityIndicator animating size="large" />
      </View>
    );
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    setPage(page + 1);
  };

  const handleKeyExtractor = item => item.id.toString();

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={{ marginTop: 20 }}>
        <FlatList
          data={data}
          keyExtractor={handleKeyExtractor}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          initialNumToRender={30}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          ListFooterComponent={renderFooter}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => openPost(item.url)}>
              <View style={{ flexDirection: "row", padding: 15 }}>
                <Image
                  source={{ uri: item.image }}
                  style={{ width: 80, height: 80 }}
                />
                <View style={{ flex: 1, paddingLeft: 10 }}>
                  <Text
                    style={{ fontSize: 16, fontWeight: "300" }}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {item.title}
                  </Text>
                  <View style={{ paddingTop: 5 }} />
                  <Text
                    style={{
                      color: "lightgrey",
                      fontSize: 14
                    }}
                  >
                    {item.tags.join(",")}
                  </Text>
                  <View style={{ paddingTop: 5 }} />
                  <Text style={{ fontSize: 12 }}>
                    {moment(item.publishedAt).fromNow()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  }
});

export default App;

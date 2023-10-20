import React, { useEffect, useState } from "react";
import { Pressable, Text, ImageBackground, ScrollView } from "react-native";
import axios from "axios";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
const Stack = createNativeStackNavigator();
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";

const CACHE_KEY = "REACT_QUERY_CACHE";
const queryClient = new QueryClient();

const Navigation = () => {
  // react query shows stale data at first then fetches new data in the backgroiund
  // which results showing instant data, also it provides automatic refetching on failure

  const { data, error, isLoading } = useQuery("restaurants", fetchRestaurants);
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    // we are retrieving data from storage before entering the screen for
    //immediate show
    loadQueryCache().then((res) => {
      setRestaurants(res.businesses);
    });

    return () => {};
  }, []);
  useEffect(() => {
    setRestaurants(data?.data.businesses);
    return () => {};
  }, [isLoading]);
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="Resturants"
          component={(props) => (
            <Resturants
              {...props}
              restaurants={restaurants}
              isLoading={isLoading}
            />
          )}
        />
        <Stack.Screen name="Details" component={Details} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const HomeScreen = ({ navigation }) => {
  return (
    <Pressable
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
      onPress={() => navigation.navigate("Resturants")}
    >
      <Text style={{ backgroundColor: "yellow", padding: 5, borderRadius: 20 }}>
        Go To Resturant
      </Text>
    </Pressable>
  );
};
const Resturants = ({ navigation, restaurants, isLoading }) => {
  useEffect(() => {
    return () => {
      // caching existing version of data on component unmount
      const dataForRestaurants = queryClient.getQueryData("restaurants");
      saveQueryCache(dataForRestaurants.data);
    };
  }, [navigation]);

  return (
    <ScrollView>
      {restaurants?.map((rest) => (
        <Pressable
          onPress={() => navigation.navigate("Details", { restaurant: rest })}
        >
          <ImageBackground
            style={{ width: 200, height: 200 }}
            source={{
              uri: rest.image_url,
            }}
          >
            <Text style={{ color: "white" }}>{rest.name}</Text>
          </ImageBackground>
        </Pressable>
      ))}
    </ScrollView>
  );
};
const Details = ({ navigation, route }) => {
  const { restaurant } = { ...route.params };
  return <Text>{JSON.stringify(restaurant)}</Text>;
};
const fetchRestaurants = () => {
  return axios
    .get(
      "https://raw.githubusercontent.com/kholood-ea/inova-assignment/master/Resturants.json"
    )
    .then((response) => {
      return response;
    });
};

export const saveQueryCache = async (cache) => {
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
};

export const loadQueryCache = async () => {
  const cache = await AsyncStorage.getItem(CACHE_KEY);
  return JSON.parse(cache);
};
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Navigation />
    </QueryClientProvider>
  );
}

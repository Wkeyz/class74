import React from 'react';
import { Text, View,StyleSheet, FlatList,TextInput, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import db from '../config'
export default class Searchscreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      allTransactions: [],
      lastVisibleTransaction: null,
      search: ''
    }
  }
  fetchMoreTransaction = async () => {
    var text = this.state.search.toUpperCase();
    var enteredText = text.split("")
    if (enteredText[0].toUpperCase() === 'B') {
      const query = db.collection("transaction").where('bookId', '==', text).startAfter(this.state.lastVisibleTransaction)
        .limit(10).get()
      query.docs.map({ allTransactions: [...this.state.allTransactions, doc.data()], lastVisibleTransaction: doc })


    }
    else if (enteredText[0].toUpperCase() === 'S') {
      const query = db.collection("transaction").where('studentId', '==', text).startAfter(this.state.lastVisibleTransaction)
        .limit(10).get()
      query.docs.map({ allTransactions: [...this.state.allTransactions, doc.data()], lastVisibleTransaction: doc })


    }
  }
  searchTransaction = async (text) => {
    var enteredText = text.split("")
    if (enteredText[0].toUpperCase() === 'B') {
      const transaction = await db.collection("transaction").where('bookId', '==', text).get()
      transaction.docs.map((doc) => {
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()],
          lastVisibleTransaction: doc

        })
      })
    }
    else if (enteredText[0].toUpperCase() === 'S') {
      const transaction = await db.collection("transaction").where('studentId', '==', text).get()
      transaction.docs.map((doc) => {
        this.setState({
          allTransactions: [...this.state.allTransactions, doc.data()],
          lastVisibleTransaction: doc

        })
      })
    }
  }
  componentDidMount = async () => {
    const query = await db.collection("transaction").limit(10).get()
    query.docs.map((doc) => {
      this.setState({
        allTransactions: [],
        lastVisibleTransaction: doc
      })
    })
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.searchBar}>
          <TextInput style={styles.bar} placeholder="Enter Book or Student Id"
            onChangeText={(text) => {
              this.setState({
                search: text
              })
            }}>

          </TextInput>
          <TouchableOpacity style={styles.searchButton} onPress={() => { this.searchTransaction(this.state.search) }}>
            <Text>Search</Text>
          </TouchableOpacity>
        </View>
        <FlatList data={this.state.allTransactions}
          renderItem={({ item }) => (
            <View style={{ borderBottomWidth: 2 }} key={index}>
              <Text>
                {"Book Id: " + transaction.bookId}
              </Text>
              <Text>
                {"Student Id: " + transaction.studentId}
              </Text>
              <Text>
                {"Transaction Type: " + transaction.transactionType}
              </Text>
              <Text>
                {"Date: " + transaction.date}
              </Text>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
          onEndReached={this.fetchMoreTransaction}
          onEndReachedThreshold={0.7}>
        </FlatList>
      </View>

    );
  }
}

const styles = StyleSheet.create({ container: { flex: 1, marginTop: 20 }, searchBar: { flexDirection: 'row', height: 40, width: 'auto', borderWidth: 0.5, alignItems: 'center', backgroundColor: 'grey', }, bar: { borderWidth: 2, height: 30, width: 300, paddingLeft: 10, }, searchButton: { borderWidth: 1, height: 30, width: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: 'green' } })
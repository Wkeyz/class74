import React from 'react';
import { Text, View, TouchableOpacity, TextInput, Image, StyleSheet, 
KeyboardAvoidingView,
Alert, ToastAndroid } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { TabRouter } from 'react-navigation';
import db from '../config';
import firebase from 'firebase'
export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedBookId: '',
        scannedStudentId:'',
        buttonState: 'normal',
        transactionMessage:'',
      }
    }

    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }
    
    
    initiateBookReturn=async()=>{
      console.log("hi")
      db.collection('transaction').add({
        'studentId':this.state.scannedStudentId,
        'bookId':this.state.scannedBookId,
        'date':firebase.firestore.Timestamp.now().toDate(),
        'transactionType':"Return"
      })
      db.collection('books').doc(this.state.scannedBookId).update({
        'bookAvailability':true
      })
      db.collection("students").doc(this.state.scannedStudentId).update({
        'numberOfBooksIssued':firebase.firestore.FieldValue.increment(-1)
      })
      this.setState({
        scannedStudentId:'',
        scannedBookId:''
      })
    }
    
    initiateBookIssue=async()=>{
      console.log("CHECK")
      db.collection('transaction').add({
        'studentId':this.state.scannedStudentId,
        'bookId':this.state.scannedBookId,
        'date':firebase.firestore.Timestamp.now().toDate(),
        'transactionType':"Issued"
      })
      db.collection('books').doc(this.state.scannedBookId).update({
        'bookAvailability':false
      })
      db.collection("students").doc(this.state.scannedStudentId).update({
        'numberOfBooksIssued':firebase.firestore.FieldValue.increment(+1)
      })
      this.setState({
        scannedStudentId:'',
        scannedBookId:''
      })
    }
    checkBookEligibility = async()=>{
      const bookRef = await db.collection("books").where("bookId","==",this.state.scannedBookId)
      .get()
      var transactionType = ""
      console.log(bookRef.docs.length)
      if(bookRef.docs.length===0){
        transactionType = false
      }
      else{
       
        bookRef.docs.map(doc=>{

          var book = doc.data();
          console.log("hi"+book)
          if(book.bookAvailability){
            transactionType = "Issued"
          }
          else{
            transactionType = "Return"
          }
      }) 
     }
     return transactionType;
    }
    checkStudentEligibilityForBookIssue=async()=>{
      const studentRef = await db.collection("students").where("studentId","==",this.state.scannedStudentId)
      .get()
      var isStudentEligibility = ""
      if(studentRef.docs.length===0){
        this.setState({
          scannedStudentId:"",
          scannedBookId:""
        })
        isStudentEligibility = false
        Alert.alert("The Student Id Does not Exist In the Database!")
      }
      else{
        studentRef.docs.map(doc=>{
          var student = doc.data()
          if(student.numberOfBooksIssued<2){
            isStudentEligibility=true
          }
          else{
            isStudentEligibility = false
            Alert.alert("The Student Has Already Issued 2 Books!")
            this.setState({
              scannedStudentId:"",
              scannedBookId:""
            })
          }
        })
      }
      return isStudentEligibility;
    }
    checkStudentEligibilityForBookReturn=async()=>{
      const transactionRef = await db.collection("transaction").where("bookId","==",this.state.scannedBookId)
      .limit(1).get()
      var isStudentEligibility = ""
        console.log("Length="+transactionRef.docs.length);
        transactionRef.docs.map(doc=>{
         var lastBookTransaction = doc.data()
         if(lastBookTransaction.studentId===this.state.scannedStudentId){
          isStudentEligibility = true
         }
         else{
           isStudentEligibility = false
           Alert.alert("The Book Wasn't Issued By The Student!")
           this.setState({
             scannedBookId:'',
             scannedStudentId:''
           })
         }
        })
      
      return isStudentEligibility;
    }
    handleTransaction=async()=>{
      var transactionType = await this.checkBookEligibility();
      console.log(transactionType)
      if(!transactionType){
        Alert.alert("The Book Does Not Exist In the Database!")
        this.setState({
          scannedStudentId:'',
          scannedBookId:''
        })
      }
      else if(transactionType==="Issued"){
        var isStudentEligibility = await this.checkStudentEligibilityForBookIssue();
         if(isStudentEligibility){
          this.initiateBookIssue();
          Alert.alert("The Book Was Issued To The Student!")
         }
      }
      else{
        var isStudentEligibility = await this.checkStudentEligibilityForBookReturn();
         if(isStudentEligibility){
          this.initiateBookReturn();
          Alert.alert("The Book Was Returned To The Library!")
         }
      }
      // var transactionMessage=null
      // db.collection('books').doc(this.state.scannedBookId).get()
      // .then((doc)=>{
      //   console.log(doc.data())
      //   var book = doc.data()
      //   if(book.bookAvailability){
      //     this.initiateBookIssue()
      //     transactionMessage = "Book Issued"
      //     Alert.alert(transactionMessage)
      //     //ToastAndroid.show(transactionMessage, ToastAndroid.SHORT)
      //   }
      //   else{
      //     this.initiateBookReturn()
      //     transactionMessage = "Book Returned"
      //    Alert.alert(transactionMessage)
      //     //ToastAndroid.show(transactionMessage, ToastAndroid.SHORT)
      //   }
      // })
      // this.setState({
      //   transactionMessage:transactionMessage
      // })
    }
    handleBarCodeScanned = async({type, data})=>{
      const {buttonState} = this.state
      

      if(buttonState==="BookId"){
        this.setState({
          scanned: true,
          scannedBookId: data,
          buttonState: 'normal'
        });
        
      }
      else if(buttonState==="StudentId"){
        this.setState({
          scanned: true,
          scannedStudentId: data,
          buttonState: 'normal'
        });
      }
      
    }

    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          
          <KeyboardAvoidingView style={styles.container}
          behavior="padding" enabled
          >
            <View>
              <Image
                source={require("../assets/booklogo.jpg")}
                style={{width:200, height: 200}}/>
              <Text style={{textAlign: 'center', fontSize: 30}}>Wily</Text>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Book Id"
              onChangeText={text=>{this.setState({
                scannedBookId:text
              })}}
              value={this.state.scannedBookId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("BookId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Student Id"
              onChangeText={text=>{this.setState({
                scannedStudentId:text
              })}}
              value={this.state.scannedStudentId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("StudentId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <Text>
              {this.state.transactionMessage}
            </Text>
            <TouchableOpacity style={styles.submitButton}
            onPress={async()=>{var transactionMessage = await this.handleTransaction();
              this.setState({
                scannedBookId:'',
                scannedStudentId:''
              });
            }}>
              <Text style={styles.submitButtonText}> 
                Submit
              </Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    submitButton:{
      backgroundColor:'green',
      width:100,
      height:50,
    },
    submitButtonText:{
      padding:10,
      textAlign:'center',
      fontSize:20,
      fontWeight:'bold',
      color:'white',
    },
  });
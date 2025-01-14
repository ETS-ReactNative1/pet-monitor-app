import React from 'react';

import { Text, StyleSheet, View, FlatList, TouchableOpacity, Image, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { encode as btoa } from 'base-64'

import { getJsonData } from '../utils/requests.js';
import { getSecureStoreValueFor } from '../utils/store';
import { AppButton } from '../utils/buttons.js';

import commonStyles from '../utils/styles';
import colors from '../config/colors';

/** Implements the Face Recognition search screen. */
export class FaceRecognitionSearchScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            userNotices: [],
            userId: '',
            noticeId: ''
        };
    }

    setSelectedPhoto = (noticeId) => {
        this.setState({ noticeId: noticeId });
    }

    renderPet = ({item}) =>  {
        const noticeId = item.noticeId
        return (
            <TouchableOpacity onPress={() => this.setSelectedPhoto(noticeId)} style={{borderColor: this.state.noticeId == noticeId ? colors.secondary : colors.white, borderWidth: 3, borderRadius: 5}}>
                <Image key={'img_' + noticeId} resizeMode="cover" style={{aspectRatio: 1, height: 100, borderRadius: 5, margin: 3}} source={{ uri:
                    'data:image/jpeg;base64,' + this.arrayBufferToBase64(item.pet.photo),}}/>
            </TouchableOpacity>
        )
    }

    navigateToSearchResults = () => {
        if (this.state.userNotices.length == 0) {
            alert("Debes tener al menos un reporte abierto!")
            return;
        }

        if (this.state.noticeId.length == 0) {
            alert("Debes seleccionar un reporte!")
            return;
        }
        this.props.navigation.push('FaceRecognitionResults', { noticeId: this.state.noticeId, userId: this.state.userId }); 
    }

    arrayBufferToBase64 = buffer => {
        let binary = '';
        let bytes = new Uint8Array(buffer);
        let len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    };

    componentDidMount() {
        getSecureStoreValueFor('sessionToken').then(sessionToken =>  
            getSecureStoreValueFor("userId").then(userId => {
                getJsonData(global.noticeServiceBaseUrl + '/users/' + userId + '/notices', 
                {
                    'Authorization': 'Basic ' + sessionToken 
                }
                ).then(notices => {
                    this.setState({ 
                        userNotices: notices,
                        userId: userId
                    });
                    
                }).catch(err => {
                    console.log(err);
                    alert(err)
                });
            })
        )
    }

    render() {
        return (
            <View style={commonStyles.container}>
                <ScrollView style={{flex:1, padding: 20}}>
                <Text style={{margin: 20, color: colors.clearBlack, fontSize: 16, marginTop: 30}}>Si perdiste o encontraste a una mascota podés iniciar una búsqueda por  reconocimiento facial para encontrar  mascotas similares.</Text>
                <Text style={styles.sectionTitle}>Seleccionar mascota</Text>
                {this.state.userNotices.length > 0 ? <>
                    <FlatList 
                        data={this.state.userNotices} 
                        horizontal={true}
                        keyExtractor={(_, index) => index.toString()}
                        initialNumToRender={this.state.userNotices.length}
                        renderItem={this.renderPet}
                        style={{paddingLeft: 15, marginRight: 10, marginTop: 10}}
                    />
                </> : <Text style={{margin: 20, color: colors.clearBlack, fontSize: 15, marginTop: 20}}>No hay reportes creados aún. Para realizar una búsqueda, se requiere tener al menos reporte activo de la mascota de interés. </Text>}
                {/* <TouchableOpacity style={styles.button} onPress={() => this.navigateToCreatePet()}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Icon name='plus' size={20} color={colors.white} />
                        <Text style={[styles.buttonFont, {paddingLeft: 10}]}>Mascota nueva</Text>
                    </View>
                </TouchableOpacity>  */}

                <AppButton 
                    buttonText={"Buscar"} 
                    onPress={this.navigateToSearchResults} 
                    additionalButtonStyles={styles.buttonSearch} 
                    additionalTextStyles={{paddingLeft: 10}}
                    additionalElement={<Icon name='search' size={20} color={colors.white} />}
                    isDisabled={this.state.userNotices.length == 0 } />

                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    sectionTitle: {
        fontSize: 20, 
        color: colors.secondary,
        paddingLeft: 20, 
        paddingTop: 25, 
        paddingBottom: 5, 
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: colors.secondary,
        marginTop: 10,
        marginLeft: 10,
        padding: 18, 
        borderRadius: 7, 
        width: '55%', 
        alignSelf: 'flex-start'
    },
    buttonSearch: {
        backgroundColor: colors.secondary,
        marginTop: 30,
        width: '50%', 
        alignSelf: 'center'
    },
});

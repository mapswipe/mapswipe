import React from "react";
import {
    Text,
    View,
    Platform,
    ScrollView,
    ListView,
    StyleSheet,
    Image,
    ImageBackground,
    TouchableHighlight,
    Dimensions,
    Alert,
    TimerMixin,
    AsyncStorage
} from "react-native";
import * as Animatable from "react-native-animatable";
import Button from "apsl-react-native-button";
var Modal = require('react-native-modalbox');
var GLOBAL = require('../Globals');
var store = require('react-native-simple-store');
var MessageBarManager = require('react-native-message-bar').MessageBarManager;
import * as Progress from 'react-native-progress';
import DeviceInfo from 'react-native-device-info';
var RNFS = require('react-native-fs');
var LoadingIcon = require('./LoadingIcon');
var _mapper = null;


var styles = StyleSheet.create({
    startButton: {
        backgroundColor: '#0d1949',
        alignItems: 'stretch',

        height: 50,
        padding: 12,
        borderRadius: 5,
        borderWidth: 0.1,
        position: 'absolute',
        bottom: 20,
        left: 20,
        width: 260
    },
    header: {
        fontWeight: '700',
        color: '#212121',
        fontSize: 18,
    },
    tutRow: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        height: 40,
    },

    tutPar: {
        fontSize: 14,
        color: 'rgba(0,0,0,0.54)',
        fontWeight: '500',
        lineHeight: 20,
    },

    loadingText: {
        color: '#ffffff',
        fontWeight: '300',
        fontSize: 20,
        marginTop: 20,
    },
    tutText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#50acd4',
        marginTop: 10,
        marginLeft: 5,
    },

    tutImage: {
        height: 30,
        resizeMode: 'contain'
    },
    tutImage2: {
        height: 30,
        resizeMode: 'contain'
    },


    modal: {
        padding: 20,
    },

    modal2: {
        height: 230,
        backgroundColor: "#3B5998"
    },

    modal3: {
        height: 500 > GLOBAL.SCREEN_HEIGHT ? GLOBAL.SCREEN_HEIGHT - 50 : 500,
        width: 300,
        backgroundColor: "#ffffff",
        borderRadius: 2
    },


    tilePopup: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: 300,
        width: 300,
        backgroundColor: "transparent"
    },

    modal4: {
        height: 300
    },

    btn: {
        margin: 10,
        backgroundColor: "#3B5998",
        color: "white",
        padding: 10
    },

    btnModal: {
        position: "absolute",
        top: 0,
        right: 0,
        width: 50,
        height: 50,
        backgroundColor: "transparent"
    },

    text: {
        color: "#212121",
        fontSize: 22
    },
    tile: {
        height: (GLOBAL.SCREEN_HEIGHT * GLOBAL.TILE_VIEW_HEIGHT * (1 / GLOBAL.TILES_PER_VIEW_X)),
        width: (GLOBAL.SCREEN_WIDTH * (1 / 2)),
        backgroundColor: '#e8e8e8'
    },

    emptyTile: {
        width: (GLOBAL.SCREEN_WIDTH * (1 / 2)),
        backgroundColor: '#e8e8e8',
        borderWidth: 1,
        borderTopWidth: 1,
        borderColor: '#212121'
    },


    finishedText: {
        textAlign: 'center',
        color: '#ffffff',
    },
    animatedText: {
        fontWeight: '900',
        fontSize: 20,
        color: '#BBF1FF',
        textAlign: 'center',
        marginTop: 50,
        backgroundColor: 'transparent'
    },
    moreButton: {
        backgroundColor: '#0d1949',
        marginTop: 20,
        width: (GLOBAL.SCREEN_WIDTH * (1 / 2)),
        marginLeft: (GLOBAL.SCREEN_WIDTH * (1 / 4)),
        height: 50,
        padding: 12,
        borderRadius: 5,
        borderWidth: 0.1,
    },
    mappingContainer: {
        backgroundColor: '#0d1949',
        height: GLOBAL.SCREEN_HEIGHT,
        width: GLOBAL.SCREEN_WIDTH,
    },
    wrapper: {
        flex: 1,
        backgroundColor: '#0d1949',
        position: 'absolute',
        left: 0,
        bottom: 30,
    },
    slide: {
        width: (GLOBAL.SCREEN_WIDTH),
        height: (GLOBAL.SCREEN_HEIGHT * GLOBAL.TILE_VIEW_HEIGHT),
        flex: 1,
        borderWidth: 0,
        backgroundColor: '#212121',
        justifyContent: 'flex-start',
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    congratulationsSlide: {

        width: (GLOBAL.SCREEN_WIDTH),
        height: (GLOBAL.SCREEN_HEIGHT * GLOBAL.TILE_VIEW_HEIGHT),

        borderWidth: 0,
        backgroundColor: '#212121',
        justifyContent: 'center',

        flexDirection: 'column',
        alignItems: 'center',
    },
    text: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    buttonText: {
        color: '#ee0000',
    },
    progressBar: {
        width: (GLOBAL.SCREEN_WIDTH),
        position: 'absolute',
        left: 0,
        top: 0,
    },
    tileRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        flex: 1,

    },


    debugOverlay: {
        //backgroundColor:'yellow',
        color: '#ffffff',
        fontSize: 6,
        textAlign: 'center',
        backgroundColor: 'transparent'
    },
    debugOverlay2: {
        //backgroundColor:'yellow',
        color: '#ffffff',
        fontSize: 10,
        textAlign: 'center',
        backgroundColor: 'transparent'
    },

    resetRow: {
        flex: 1,


    },

    backButton: {
        width: 20,
        height: 20,
    },


    backButtonContainer: {
        width: 40,
        height: 40,
        top: 0,
        padding: 10,
        left: 0,
        position: 'absolute'
    },
    infoButton: {
        width: 20,
        height: 20,

    },

    infoButtonContainer: {
        width: 20,
        height: 20,
        top: 10,
        right: 20,
        position: 'absolute'
    },
    swipeNavTop: {
        width: (GLOBAL.SCREEN_WIDTH),
        height: 40,

    },
    swipeNavBottom: {
        width: (GLOBAL.SCREEN_WIDTH),
        bottom: 3,
        position: 'absolute',
        left: 0,

        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: '#0d1949',
    },

    topText: {
        justifyContent: 'center',
        color: '#ffffff',
        alignItems: 'center',
        textAlign: 'center',
        marginTop: 1,
        backgroundColor: 'transparent'
    },

    elementText: {
        justifyContent: 'center',
        color: '#ffffff',
        alignItems: 'center',
        textAlign: 'center',
        marginTop: 2,
        fontSize: 11,
        fontWeight: '700',
        backgroundColor: 'transparent'
    },

    oneOfThree: {
        flex: 1 / 3,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },

    underText: {
        color: '#ffffff',
        marginLeft: 10
    },
    inlineIcon: {
        width: 20,
        height: 20
    }
})

// see if we have a group in memory
// if not, download download a task
// store the task in memory


class Mapper extends React.Component {
    constructor(props) {
        super(props);
        this.data = this.props.navigation.getParam('data', null);
        this.state = {
            isOpen: false,
            isDisabled: false,
            swipeToClose: false,
            tilePopupDisabled: true,
            sliderValue: 0.3,
            poppedUpTile: null
        };
    }

    componentDidMount() {
        this.openModal3();
      //GLOBAL.ANALYTICS.logEvent('mapping_started');
        _mapper = this;
    }

    componentWillUnmount() {
        this.refs.cardbody.resetState();
    }

    toggleDisable = () => {
        this.setState({isDisabled: !this.state.isDisabled});
    }

    toggleSwipeToClose = () => {
        this.setState({swipeToClose: !this.state.swipeToClose});
    }

    onClose() {
        console.log('Modal just closed');
    }

    onOpen() {
        console.log('Modal just openned');
    }

    onClosingState(state) {
        console.log('the open/close of the swipeToClose just changed');
    }

    openModal3 = (id) => {
        this.refs.modal3.open();
    }

    returnToView = () => {
        this.refs.cardbody.resetState();
        this.props.navigation.pop();
    }

    closeModal3 = (id) => {
        this.refs.modal3.close();
    }

    openTilePopup = (tile) => {
        this.setState({
            isOpen: false,
            isDisabled: false,
            swipeToClose: false,
            tilePopupDisabled: false,
            sliderValue: 0.3,
            poppedUpTile: tile
        });
        this.refs.tilePopup.open();
    }

    closeTilePopup = (id) => {
        this.setState({
            isOpen: false,
            isDisabled: false,
            swipeToClose: false,
            tilePopupDisabled: true,
            sliderValue: 0.3,
            poppedUpTile: <View></View>
        });
        this.refs.tilePopup.close();
    }

    getProgress = () => (this.refs.progress);

    render() {
        return <View style={styles.mappingContainer}>
            <View style={styles.swipeNavTop}>
                <Text style={styles.topText}>
                    You are looking for:
                </Text>
                <Text style={styles.elementText}>
                    {this.data.lookFor}
                </Text>
                <TouchableHighlight style={styles.backButtonContainer} onPress={this.returnToView}><Image
                    style={styles.backButton} source={require('./assets/backarrow_icon.png')}/></TouchableHighlight>

                <TouchableHighlight style={styles.infoButtonContainer} onPress={this.openModal3}><Image
                    style={styles.infoButton} source={require('./assets/info_icon.png')}/></TouchableHighlight>
            </View>


            <CardBody data={this.data} paging={true} navigation={this.props.navigation}
                      ref={"cardbody"}/>
            <BottomProgress ref={"progress"}/>
            <Modal style={[styles.modal, styles.modal3]} backdropType="blur" position={"center"} ref={"modal3"}
                   isDisabled={this.state.isDisabled}>
                <Text style={styles.header}>How To Contribute</Text>
                <View style={styles.tutRow}><Image source={require('./assets/tap_icon.png')}
                                                   style={styles.tutImage}/><Text style={styles.tutText}>TAP TO
                    SELECT</Text></View>
                <Text style={styles.tutPar}>Search the image for features listed in your mission brief. Tap each tile
                    where you find what you're looking for. Tap once for <Text
                        style={{color: 'rgb(36, 219, 26)'}}>YES</Text>, twice for <Text
                        style={{color: 'rgb(237, 209, 28)'}}>MAYBE</Text>, and three times for <Text
                        style={{color: 'rgb(230, 28, 28)'}}>BAD IMAGERY (such as clouds)</Text>.</Text>
                <View style={styles.tutRow}><Image source={require('./assets/swipeleft_icon.png')}
                                                   style={styles.tutImage2}/><Text style={styles.tutText}>SWIPE TO
                    NAVIGATE</Text></View>
                <Text style={styles.tutPar}>When you feel confident you are done with a piece of the map, scroll to the
                    next one by simply swiping.</Text>
                <View style={styles.tutRow}><Image source={require('./assets/tap_icon.png')}
                                                   style={styles.tutImage2}/><Text style={styles.tutText}>HOLD TO
                    ZOOM</Text></View>
                <Text style={styles.tutPar}>Hold a tile to zoom in on the tile.</Text>
                <Button style={styles.startButton} onPress={this.closeModal3}
                        textStyle={{fontSize: 13, color: '#ffffff', fontWeight: '700'}}>
                    I understand
                </Button>
            </Modal>
            <Modal style={styles.tilePopup} backdropType="none" entry={"bottom"} position={"center"} ref={"tilePopup"}
                   isDisabled={this.state.tilePopupDisabled} forceToFront={true}>{this.state.poppedUpTile}</Modal>
        </View>;
        //<Image style={styles.inlineIcon} source={require('./assets/swipeup_icon.png')} /><Text style={styles.underText}>FLAG</Text>
        //return  <View style={style.mapper}><Text>{this.props.data.name}</Text></View>;
        // goes under cardbody
        /*

         return '';
         }

         case 2: {
         return '';
         }
         case 3: {
         return ';
         */
    }
}

class BottomProgress extends React.Component {

    getBarStyle(progress) {
        return {
            height: 20,
            width: GLOBAL.SCREEN_WIDTH * 0.98,
            borderRadius: 0,
            marginBottom: 2,
        }
    }

    getBarTextStyle(progress) {
        return {
            color: '#ffffff',
            borderColor: '#212121',
            fontWeight: '500',
            position: 'absolute',
            top: 1,
            left: GLOBAL.SCREEN_WIDTH - 160,
            backgroundColor: 'transparent',
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            progress: 0,
            barStyle: this.getBarStyle(0),
            textStyle: this.getBarTextStyle(0),
            text: "START MAPPING"
        };
    }

    updateProgress = (event, cardsLength) => {
        var newProgress = event.nativeEvent.contentOffset.x / (GLOBAL.SCREEN_WIDTH * cardsLength);
        this.setState({
            progress: newProgress,
            barStyle: this.getBarStyle(newProgress),
            textStyle: this.getBarTextStyle(newProgress),
            text: "YOU'VE MAPPED " + Math.ceil(newProgress * 100) + "%"
        });
    }

    render() {
        return <View style={styles.swipeNavBottom}>
            <Progress.Bar
                height={20}
                width={GLOBAL.SCREEN_WIDTH * 0.98}
                marginBottom={2}
                borderRadius={0}
                unfilledColor={'#ffffff'}
                progress={this.state.progress}
            />
            <Text elevation={5} style={this.state.textStyle}>{this.state.text}</Text>
        </View>
    }
}

class IndividualCard extends React.Component {

    render() {
        var rows = [];
        this.props.card.tileRows.forEach(function (row) {
            rows.unshift(<TileRow key={row.cardXStart + ":" + row.rowYStart} row={row.tiles}/>);
        });

        return <View style={styles.slide}>
            {rows}
        </View>;
    }
}

class LoadMoreCard extends React.Component {

    _onMore = () => {
      //GLOBAL.ANALYTICS.logEvent('complete_group');
        var parent = this;
        console.log("made it to more");
        MessageBarManager.showAlert({
            title: 'Sync Alert',
            message: 'Syncing your tasks.. do not close',
            alertType: 'info',
            // See Properties section for full customization
            // Or check `index.ios.js` or `index.android.js` for a complete example
        });
        GLOBAL.DB.addGroupComplete(this.props.groupInfo.project, this.props.groupInfo.group).then(data => {
            console.log("did group complete");
            _mapper.refs.cardbody.resetState();
            console.log("hello2");

            GLOBAL.DB.getSingleGroup(this.props.groupInfo.project).then((data) => {
                console.log("got new one")
                console.log("hello2");
                _mapper.refs.cardbody.generateCards(data.group);

            }).catch(function (error) {
                console.log("Show error here");
                console.log(error);
            });

            console.log("Completed group report");
            GLOBAL.DB.syncAndDeIndex().then(data => {
                MessageBarManager.showAlert({
                    title: data.successCount + " tasks synced",
                    message: data.errorCount + " failures",
                    alertType: 'success',
                    // See Properties section for full customization
                    // Or check `index.ios.js` or `index.android.js` for a complete example
                });
            }).catch(error => {
                MessageBarManager.showAlert({
                    title: data.successCount + " tasks synced",
                    message: data.errorCount + " failures",
                    alertType: 'error',
                    // See Properties section for full customization
                    // Or check `index.ios.js` or `index.android.js` for a complete example
                });
            });
        });
    }

    _onComplete = () => {
      //GLOBAL.ANALYTICS.logEvent('complete_group');
        var parent = this;
        GLOBAL.DB.addGroupComplete(this.props.groupInfo.project, this.props.groupInfo.group).then(data => {
            _mapper.refs.cardbody.resetState();

            console.log("Completed group report");
            MessageBarManager.showAlert({
                title: 'Sync Alert',
                message: 'Syncing your tasks.. do not close',
                alertType: 'info',
                // See Properties section for full customization
                // Or check `index.ios.js` or `index.android.js` for a complete example
            });
            GLOBAL.DB.syncAndDeIndex().then(data => {
                MessageBarManager.showAlert({
                    title: data.successCount + " tasks synced",
                    message: data.errorCount + " failures",
                    alertType: 'success',
                    // See Properties section for full customization
                    // Or check `index.ios.js` or `index.android.js` for a complete example
                });
                _mapper.props.navigation.pop();
            }).catch(error => {
                MessageBarManager.showAlert({
                    title: data.successCount + " tasks synced",
                    message: data.errorCount + " failures",
                    alertType: 'error',
                    // See Properties section for full customization
                    // Or check `index.ios.js` or `index.android.js` for a complete example
                });
                _mapper.props.navigation.pop();
            });
        });

    }

    _onBack() {
        _mapper.refs.cardbody.resetState();
        _mapper.props.navigation.pop();
        // save the current tasks but don't add a completeCount
        //_mapper.props.navigation.push({id:1, data: _mapper.props.data});
    }

    render() {
        var rows = [];
        this.props.card.tileRows.forEach(function (row) {

            rows.push(<TileRow key={row.cardX + ":" + row.rowYStart} row={row.tiles}/>);
        });

        return <View style={styles.congratulationsSlide}>
            <Text style={styles.finishedText}>Great job! You finished this group. Do you want to continue to map more in
                this project? </Text>

            <Button style={styles.moreButton} onPress={this._onMore} textStyle={{fontSize: 18, color: '#ffffff'}}>Map
                further</Button>
            <Button style={styles.moreButton} onPress={this._onComplete} textStyle={{fontSize: 18, color: '#ffffff'}}>Complete
                Session</Button>
        </View>;
    }
}

//  <Button style={styles.moreButton} onPress={this._onMore} textStyle={{fontSize: 18, color: '#ffffff'}}>Contribute More</Button>
class TileRow extends React.Component {

    render() {
        var rows = [];

        var xMin = this.props.row.cardXStart;
        var xOffset = 0;


        var pushedEmptyRows = false;
        var parent = this;
        this.props.row.forEach(function (tile) {

            // inserts empty tiles so that they are always rendered at the same X coordinate on the grid.
            if (tile !== undefined) {

                if (tile === "emptytile") {
                    rows.push(<EmptyTile key={Math.random()}/>);
                } else {
                    rows.push(<Tile data={tile} key={tile.id}/>);

                }
            }
            xOffset++;
        });
        //
        return <View style={styles.tileRow}>
            {rows}
        </View>;
    }
}

class Tile extends React.Component {


    checkToReport = () => {
        var parent = this;

        if (this.tileStatus != this.lastReportedStatus) {

            this.lastReportedStatus = this.tileStatus;
            var tile = this.props.data;
            var task = {
                id: tile.id,
                result: this.tileStatus,
                projectId: tile.projectId,
                wkt: tile.wkt,
                item: _mapper.data.lookFor,
                device: DeviceInfo.getUniqueID(),
                user: GLOBAL.DB.getAuth().getUser().uid,
                timestamp: GLOBAL.DB.getTimestamp()
            };
            // adds the task result, if fail, try again every second until it is added.
            GLOBAL.DB.taskReadyForProcessing(task);
        }
    }

    getEdgeColor = () => {
        switch (this.tileStatus) {
            case 0: {
                return 'rgba(255,255,255,0.0)';
            }

            case 1: {
                return 'rgba(36, 219, 26, 0.2)';
            }

            case 2: {
                return 'rgba(237, 209, 28, 0.2)';
            }
            case 3: {
                return 'rgba(230, 28, 28, 0.2)';
            }
        }
        return '#212121';
    }

    constructor(props) {
        super(props);
        this.tileStatus = 0;
        this.lastReportedStatus = -1;
        this.reportActive = null;

        this.state = {
            tilePopupDisabled: true,
            tile: {
                height: (GLOBAL.SCREEN_HEIGHT * GLOBAL.TILE_VIEW_HEIGHT * (1 / GLOBAL.TILES_PER_VIEW_Y)),
                width: (GLOBAL.SCREEN_WIDTH * (1 / GLOBAL.TILES_PER_VIEW_X)),
                borderWidth: 0.5,
                borderColor: 'rgba(255,255,255,0.2)'

            },
            tileOverlay: {
                backgroundColor: this.getEdgeColor(),
                height: (GLOBAL.SCREEN_HEIGHT * GLOBAL.TILE_VIEW_HEIGHT * (1 / GLOBAL.TILES_PER_VIEW_Y)),
                width: (GLOBAL.SCREEN_WIDTH * (1 / GLOBAL.TILES_PER_VIEW_X)),
            },
        }
    }

    _onPressButton = () => {

        _mapper.closeTilePopup();
        this.tileStatus = this.tileStatus + 1;
        if (this.tileStatus > 3) {
            this.tileStatus = 0;
        }
        this.setState({
            tilePopupDisabled: true,
            tile: {
                height: (GLOBAL.SCREEN_HEIGHT * GLOBAL.TILE_VIEW_HEIGHT * (1 / GLOBAL.TILES_PER_VIEW_Y)),
                width: (GLOBAL.SCREEN_WIDTH * (1 / GLOBAL.TILES_PER_VIEW_X)),
                borderWidth: 0.5,
                borderColor: 'rgba(255,255,255,0.2)'

            },
            tileOverlay: {
                backgroundColor: this.getEdgeColor(),
                height: (GLOBAL.SCREEN_HEIGHT * GLOBAL.TILE_VIEW_HEIGHT * (1 / GLOBAL.TILES_PER_VIEW_Y)),
                width: (GLOBAL.SCREEN_WIDTH * (1 / GLOBAL.TILES_PER_VIEW_X)),
            },
        });

        this.checkToReport();
    }

    _onLongPress = () => {
        _mapper.openTilePopup(this.zoomRender());
    }

    _onLongPressOut() {
        _mapper.closeTilePopup();
    }


    /**
     * Returns the ["animation", "text", duration] for the fun text displayed when you map a tile!
     */
    getFunText() {
        var texts = [
            ["bounceIn", "Great Job!", "1000"],
            ["bounceIn", "With every tap you help put a family on the map", "3000"],
            ["bounceIn", "Thank you!", "1000"],
            ["bounceIn", "Your effort is helping!", "1000"],
            ["bounceIn", "Keep up the good work!", "1000"],
        ];

        var random = Math.floor(Math.random() * texts.length);
        return texts[random];
    }

    zoomRender = () => {

        var animatedRows = [];

        var tile = this.props.data;
        //var filePath = dirs.DocumentDir + '/' + tile.id + ".jpeg";
        let projectDir = RNFS.DocumentDirectoryPath + "/" + _mapper.data.id;
        let dir = projectDir + "/" + _mapper.refs.cardbody.currentGroup // e.g. /1/45

        var fileName = dir + '/' + tile.id + ".jpeg";
        var imageSource = _mapper.refs.cardbody.isOfflineGroup === true ? {
            isStatic: true,
            uri: 'file://' + fileName
        } : {uri: tile.url};


        return <Image
            style={{
                height: 300,
                width: 300,
                borderWidth: 0.5,
                borderColor: 'rgba(255,255,255,0.2)'
            }}

            source={imageSource}>
        </Image>;
    }

    render() {

        var tile = this.props.data;

        var animatedRows = [];

        var showAnim = Math.floor(Math.random() * 5);

        if (this.tileStatus === 1 && showAnim === 1) {
            animatedRows.push(<Animatable.Text key={"anim-" + tile.id} animation={this.getFunText()[0]}
                                               style={styles.animatedText}>{this.getFunText()[1]}</Animatable.Text>);
        }
        let projectDir = RNFS.DocumentDirectoryPath + "/" + _mapper.data.id;
        let dir = projectDir + "/" + _mapper.refs.cardbody.currentGroup // e.g. /1/45

        var fileName = dir + '/' + tile.id + ".jpeg";
        var imageSource = _mapper.refs.cardbody.isOfflineGroup === true ? {
            isStatic: true,
            uri: 'file://' + fileName
        } : {uri: tile.url};

        return <TouchableHighlight onPress={this._onPressButton} onLongPress={this._onLongPress}
                                   onPressOut={this._onLongPressOut}><ImageBackground
            style={this.state.tile}
            key={"touch-" + tile.id}
            source={imageSource}>
            <View style={this.state.tileOverlay} key={"view-" + tile.id}>
                {animatedRows}
            </View>

        </ImageBackground></TouchableHighlight>;
    }
//           <Text style={styles.debugOverlay}>{tile.taskX}, {tile.taskY}</Text>
}

const EmptyTile = () => (<View style={styles.emptyTile} />);

//noinspection JSAnnotator
class CardBody extends React.Component {


    resetState = () => {
        console.log("RESETTING STATE!");
        this.allCards = {};
        this.totalRenderedCount = -1;
        this.isOfflineGroup = false;
        this.currentGroup = null;
        this.setState({
            cardsInView: [],
            cardOutOfView: [],
            progress: 0,
            pagingEnabled: this.props.paging
        });

        this.refs.scrollView.scrollTo({x: 0, animated: false});
    }

    componentDidMount = () => {
        this.getTasks();
    }

    generateCards = (data) => {
        var tilesPerRow = GLOBAL.TILES_PER_VIEW_X;
        var tilesPerCol = GLOBAL.TILES_PER_VIEW_Y;
        this.currentGroup = data.id;
        this.groupXStart = data.xMin;
        this.groupXEnd = data.xMax;

        console.log("arrrrrrrrrrr");
        var key = 'project-' + data.projectId + '-group-' + data.id;
        console.log(data.projectId);
        this.isOfflineGroup = GLOBAL.DB.isOfflineGroup(key);
        if (this.isOfflineGroup === true) {
            if (this.lastMode !== 'offline') {
                this.lastMode = 'offline';
                MessageBarManager.showAlert({
                    title: 'You are mapping a downloaded group!',
                    message: 'It will work offline! ',
                    alertType: 'info',
                    // See Properties section for full customization
                    // Or check `index.ios.js` or `index.android.js` for a complete example
                });
            }
        } else {
            if (this.lastMode !== 'online') {
                this.lastMode = 'online';
                MessageBarManager.showAlert({
                    title: 'Online Mapping Activated',
                    message: 'If you want to map offline, download tasks on the project home.',
                    alertType: 'info',
                    // See Properties section for full customization
                    // Or check `index.ios.js` or `index.android.js` for a complete example
                });
            }
        }

        var cards = [];

        // iterate over all the tasksI with an interval of the tilesPerRow variable
        for (var cardX = parseFloat(data.xMin); cardX < parseFloat(data.xMax); cardX += tilesPerRow) {
            var cardToPush = {
                cardX: cardX,
                tileRows: [],
                validTiles: 0
            }

            // iterate over Y once and place all X tiles for this Y coordinate in the tile cache.
            for (var tileY = parseFloat(data.yMax); tileY >= parseFloat(data.yMin); tileY -= 1) {
                var tileRowObject = {
                    rowYStart: tileY,
                    rowYEnd: tileY,
                    cardXStart: cardX,
                    cardXEnd: cardX,
                    tiles: []
                };
                for (var tileX = parseFloat(cardX); tileX < parseFloat(cardX) + tilesPerRow; tileX += 1) {
                    if (data.tasks[data.zoomLevel + "-" + tileX + "-" + tileY] !== undefined) {
                        cardToPush.validTiles++;
                    }
                    tileRowObject.tiles.push(
                        data.tasks[data.zoomLevel + "-" + tileX + "-" + tileY] === undefined ? "emptytile" : data.tasks[data.zoomLevel + "-" + tileX + "-" + tileY]
                    );

                    if (tileY > tileRowObject.rowYEnd) {
                        tileRowObject.rowYEnd = tileY;
                    }
                    if (tileX > tileRowObject.cardXEnd) {
                        tileRowObject.cardXEnd = tileX;
                    }
                }
                cardToPush.tileRows.push(tileRowObject);
            }
            if (cardToPush.validTiles > 0) { // ensure the card has tiles
                this.totalRenderedCount++;
                this.allCards[cardToPush.cardX] = cardToPush
                cards.push(cardToPush);
            }
        }
        this.setState({
            cardsInView: cards
        })
        // when done loading, always go to the beginning
        //this.hanldeCardRender(0);
    }

    getTasks = () => {
        GLOBAL.DB.getSingleGroup(this.props.data.id).then((data) => {
            console.log("waaaaaa");
            this.generateCards(data.group);

        }).catch(function (error) {
            console.log("Show error here");
            console.error(error);
        });
    }

    constructor(props) {
        super(props);

        this.allCards = {};
        this.groupXStart = -1;
        this.groupXEnd = -1;
        this.totalRenderedCount = -1;
        this.currentGroup = null;
        this.isOfflineGroup = false;
        this.lastMode = ""; // 0 is online mapping, 1 is offline mapping
        this.currentXRenderOffset = 0; // aka the last state
        this.lastState = -1;


        this.state = {
            progress: 0,
            cardsInView: [],
            cardsOutOfView: [],
            pagingEnabled: this.props.paging,
            marginXOffset: 0,
        };
    }

    handleProgress(scrollThroughComplete) {
        if (true === true || scrollThroughComplete === this.lastState || scrollThroughComplete % 20 !== 0) {
            return;
        }

        var diff = this.lastState === -1 ? 0 : scrollThroughComplete - this.lastState;

        var renderCount = 5;
        var renderDistance = renderCount * GLOBAL.TILES_PER_VIEW_X;

        var cardDiff = diff / renderDistance;

        // we increase scroll position regardless
        this.currentXRenderOffset += cardDiff; // negative if the diff is negative, so good like this also for backwards
    }

    handleScroll = (event: Object) => {
        _mapper.refs.progress.updateProgress(event, this.totalRenderedCount);

        var progressToReport = 0;
        if (this.state.cardsInView.length > 0) {
            //console.log(this.state.cardsInView.length + " cards in view");
            progressToReport = Math.ceil(event.nativeEvent.contentOffset.x / (GLOBAL.SCREEN_WIDTH * this.state.cardsInView.length) * 100);
        }
        this.handleProgress(progressToReport);
    }

    render() {
        var rows = [];
        if (this.state.cardsInView.length > 0) {
            var lastCard = null;
            var parent = this;

            this.state.cardsInView.forEach(function (card) {
                lastCard = card;
                rows.push(<IndividualCard key={card.cardX} card={card}/>);

            });

            rows.push(<LoadMoreCard key={lastCard.id / 2} card={lastCard}
                                    groupInfo={{group: this.currentGroup, project: this.props.data.id}}/>); // lastCard.id/2 is random so that it never is the same number
        } else {
            this.showingLoader = true;
            rows.push(<LoadingIcon key={'loadingicon'}/>);
        }
        //
        return <ScrollView onScroll={this.handleScroll}
                           automaticallyAdjustInsets={false}
                           horizontal={true}
                           ref={"scrollView"}
                           pagingEnabled={this.state.pagingEnabled}
                           removeClippedSubviews={true}
                           contentContainerStyle={[styles.wrapper, {paddingHorizontal: this.state.marginXOffset}]}
        >
            {rows}
        </ScrollView>;
    }
}


module.exports = Mapper;


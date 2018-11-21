import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firebaseConnect, isLoaded, isEmpty } from 'react-redux-firebase';
import {
    ScrollView,
    StyleSheet,
    Text,
} from 'react-native';
import Button from 'apsl-react-native-button';
import Modal from 'react-native-modalbox';
import ProjectCard from './ProjectCard';
import LoadingIcon from './LoadingIcon';

const GLOBAL = require('../Globals');

const style = StyleSheet.create({
    header: {
        fontWeight: '700',
        color: '#212121',
        fontSize: 18,
    },
    inModalButton2: {
        backgroundColor: '#ee0000',
        height: 50,
        padding: 12,
        borderRadius: 5,
        borderWidth: 0.1,
        width: 260,
        marginTop: 20,
    },
    inModalButton: {
        backgroundColor: '#0d1949',
        height: 50,
        padding: 12,
        borderRadius: 5,
        borderWidth: 0.1,
        width: 260,
    },
    listView: {
        width: GLOBAL.SCREEN_WIDTH,
        flex: 0,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    modal: {
        padding: 20,
    },
    modal3: {
        marginTop: 10,
        height: 300,
        width: 300,
        backgroundColor: '#ffffff',
        borderRadius: 2,
    },
    otherButton: {
        width: GLOBAL.SCREEN_WIDTH,
        height: 30,
        padding: 12,
        marginTop: 10,
        borderWidth: 0,
    },
    tutPar: {
        fontSize: 14,
        color: '#575757',
        fontWeight: '500',
        lineHeight: 20,
        marginTop: 10,
    },
});

class _RecommendedCards extends React.Component {
    static propTypes = {
        announcement: PropTypes.object,
        navigation: PropTypes.object.isRequired,
        projects: PropTypes.array,
    }

    openModal3 = () => {
        const parent = this;

        GLOBAL.DB.openPopup().then(() => {
            console.log('No need to open new tut window');
        }).catch(() => {
            parent.refs.modal3.open();
        });
    }

    closeModal3 = () => {
        this.refs.modal3.close();
        GLOBAL.DB.stopPopup();
    }

    renderAnnouncement = () => {
        const { announcement, navigation } = this.props;
        if (!isLoaded(announcement) || isEmpty(announcement)) {
            return;
        }
        return (
            <Button
                onPress={() => {
                    navigation.push('WebviewWindow', {
                        url: announcement.url,
                    });
                }}
                key="announce"
                style={style.otherButton}
                textStyle={{
                    fontSize: 13,
                    color: 'black',
                    fontWeight: '700',
                }}
            >
                {announcement.text}
            </Button>
        );
    }

    renderHelpModal = () => {
        return (
            <Modal
                key="modal"
                style={[style.modal, style.modal3]}
                backdropType="blur"
                position="top"
                ref="modal3"
            >
                <Text style={style.header}>Tutorial</Text>
                <Text style={style.tutPar}>Learn more about how to use Mapswipe!</Text>
                <Button
                    style={style.inModalButton2}
                    onPress={() => {
                        this.closeModal3();
                        this.props.navigation.push('WebviewWindow', {
                            uri: GLOBAL.TUT_LINK,
                        });
                    }}
                    textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}
                >
                    Go To Tutorial
                </Button>
                <Button
                    style={style.inModalButton}
                    onPress={this.closeModal3}
                    textStyle={{ fontSize: 13, color: '#ffffff', fontWeight: '700' }}
                >
                    No thanks
                </Button>
            </Modal>);
    }

    render() {
        const {
            navigation,
            projects,
        } = this.props;
        if (!isLoaded(projects)) {
            return (<LoadingIcon key="icon" />);
        }
        if (isLoaded(projects) && isEmpty(projects)) {
            return (<Text>Nothing to work on!</Text>);
        }

        return (
            <ScrollView
                contentContainerStyle={style.listView}
                removeClippedSubviews
                navigation={navigation}
            >
                { this.renderAnnouncement() }
                { projects.sort((a, b) => b.value.isFeatured - a.value.isFeatured)
                    .map(project => (
                        <ProjectCard
                            navigation={navigation}
                            card={project.value}
                            key={project.key}
                            cardIndex={project.key}
                        />
                    ))
                }
                { this.renderHelpModal() }
            </ScrollView>
        );
    }
}

const mapStateToProps = (state, ownProps) => (
    {
        announcement: state.firebase.data.announcement,
        navigation: ownProps.navigation,
        projects: state.firebase.ordered.projects,
    }
);

export const RecommendedCards = compose(
    firebaseConnect(props => [
        // request only active projects from firebase
        { path: 'projects', queryParams: ['orderByChild=state', 'equalTo=0', 'limitToFirst=20'] },
        { path: 'announcement', queryParams: ['limitToLast=1'] },
    ]),
    connect(
        mapStateToProps,
    ),
)(_RecommendedCards);

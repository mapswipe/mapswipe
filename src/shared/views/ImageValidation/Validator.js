// @flow
import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import {
    TouchableHighlight,
    FlatList,
    StyleSheet,
    View,
    Text,
} from 'react-native';
import get from 'lodash.get';
import { SvgXml } from 'react-native-svg';
import { firebaseConnect, isEmpty, isLoaded } from 'react-redux-firebase';
import { MessageBarManager } from 'react-native-message-bar';
import { withTranslation } from 'react-i18next';
import Pressable from 'react-native/Libraries/Components/Pressable/Pressable';
import LoadingIcon from '../LoadingIcon';
import TutorialBox, { toCamelCase } from '../../common/Tutorial';
import RoundButtonWithTextBelow from '../../common/RoundButtonWithTextBelow';
import TutorialEndScreen from '../../common/Tutorial/TutorialEndScreen';
import TutorialIntroScreen from './TutorialIntro';
import Tasks from './IndividualTask';
import TutorialOutro from './TutorialOutro';
import {
    tutorialModes,
    COLOR_WHITE,
    COLOR_LIGHT_GRAY,
    SPACING_MEDIUM,
    SPACING_EXTRA_SMALL,
    FONT_SIZE_SMALL,
    SPACING_SMALL,
    COLOR_BLACK,
} from '../../constants';
import GLOBAL from '../../Globals';
import * as SvgIcons from '../../common/SvgIcons';

import type {
    ImageValidationGroupType,
    ImageValidationTaskType,
    NavigationProp,
    ResultMapType,
    SingleImageryProjectType,
    TutorialContent,
    ProjectInformation,
    Option,
    SubOption,
    TranslationFunction,
} from '../../flow-types';

// in order to allow enough screen height for satellite imagery on small
// screens (less than 550px high) we make buttons smaller on those screens
const buttonHeight = GLOBAL.SCREEN_HEIGHT >= 550 ? 50 : 40;

function isNaN(val) {
    if (typeof val === 'number') {
        return Number.isNaN(val);
    }
    return false;
}

function isNotDefined(val) {
    return val === undefined || val === null || isNaN(val);
}

export function isDefined(val: any): boolean {
    return !isNotDefined(val);
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        gap: SPACING_SMALL,
        alignItems: 'center',
        justifyContent: 'center',
        width: GLOBAL.SCREEN_WIDTH,
    },
    listItem: {
        position: 'absolute',
        bottom: 0,
        alignSelf: 'center',
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        width: '90%',
        backgroundColor: COLOR_WHITE,
        padding: SPACING_SMALL,
        borderRadius: SPACING_SMALL,
    },
    itemContainer: {
        flexDirection: 'row',
        gap: SPACING_SMALL,
        margin: SPACING_EXTRA_SMALL,
        padding: 10,
        backgroundColor: COLOR_LIGHT_GRAY,
        borderRadius: 4,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING_SMALL,
    },
    selectedIcon: {
        height: 25,
        width: 25,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
    },
    listItemText: {
        fontSize: FONT_SIZE_SMALL,
        color: COLOR_BLACK,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    options: {
        display: 'flex',
        width: '90%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly',
        borderRadius: 8,
        paddingBottom: SPACING_SMALL,
    },
    option: {
        flex: 1,
        minWidth: 100,
        maxWidth: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        width: '30%',
    },
    closeButton: {
        height: 20,
        width: 20,
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    listHeading: {
        textAlign: 'center',
        fontWeight: '700',
        color: '#212121',
        fontSize: 18,
        padding: SPACING_MEDIUM,
    },
});

type Props = {
    t: TranslationFunction,
    completeGroup: () => void,
    group: ImageValidationGroupType,
    navigation: NavigationProp,
    project: SingleImageryProjectType,
    results: ResultMapType,
    screens: Array<TutorialContent>,
    submitResult: (number, string) => void,
    tutorial: boolean,
    updateProgress: number => void,
    informationPages?: ProjectInformation,
    customOptions: Option[],
};

type State = {
    // the index of the current task in the task array
    currentTaskIndex: number,
    showSubOptions: boolean,
    subOptions: Array<SubOption>,
    subOptionHeading: string,
};

// see https://zhenyong.github.io/flowtype/blog/2015/11/09/Generators.html
type taskGenType = Generator<string, void, void>;

class _Validator extends React.Component<Props, State> {
    // the index of the screen currently seen
    // starts at -tutorialIntroWidth, gets to 0 when we arrive at the interactive part
    currentScreen: number;

    // the number of screens (in width) that the tutorial intro covers
    tutorialIntroWidth: number;

    // props.group.tasks are now gzipped and base64 encoded on the server
    // so we need to decode and gunzip them into a JSON string which is then
    // parsed into an array. for this project type, we do not load the tasks
    // directly, instead we do the above process and then work with the result
    // which is stored in expandedTasks
    expandedTasks: Array<ImageValidationTaskType>;

    // a reference to the flatlist, only used in tutorial mode
    flatlist: ?FlatList<React.Node>;

    scrollEnabled: boolean;

    taskGen: taskGenType;

    // keep track of how far the user has actually provided results
    // so we can disable the swipe forward option, to prevent swiping
    // past tasks they haven't provided an answer for yet
    tasksDone: number;

    constructor(props: Props) {
        super(props);
        this.state = {
            currentTaskIndex: 0,
            showSubOptions: false,
            subOptionHeading: '',
            subOptions: [],
        };
        // this remains false until the tutorial tasks are completed
        this.scrollEnabled = false;
        this.tasksDone = -1;
        this.setupTasksList(props.group.tasks);
        this.tutorialIntroWidth =
            props.informationPages && props.informationPages.length > 0
                ? props.informationPages.length + 1
                : 2;
        this.currentScreen = -this.tutorialIntroWidth;
    }

    componentDidUpdate = (prevProps: Props) => {
        // reset the taskId generator, as it might have been initialized on another project group
        const { group } = this.props;
        if (prevProps.group.tasks !== group.tasks) {
            this.setupTasksList(group.tasks);
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({ currentTaskIndex: 0 });
        }
    };

    setupTasksList = (tasks: Array<ImageValidationTaskType>) => {
        if (isLoaded(tasks) && !isEmpty(tasks)) {
            this.expandedTasks = tasks;
        }
    };

    getCurrentScreen = () => {
        // return the screen number for the tutorial examples.
        // The screens before the start of the content are numbered negatively
        // which allows to check whether we're showing an example or not
        const { currentScreen } = this;
        // const { group } = this.props;
        // const currentScreen = Math.floor((currentX - group.xMin) / 2);
        return currentScreen;
    };

    handleSelectOption = option => {
        const { tutorial } = this.props;

        if (option.subOptions) {
            this.setState(prevState => ({
                ...prevState,
                showSubOptions: true,
                subOptionHeading: option.title,
                subOptions: option.subOptions,
            }));
        } else if (!tutorial) {
            this.nextTask(option.value);
        } else {
            const { currentTaskIndex } = this.state;
            const currentTask = this.expandedTasks[currentTaskIndex];
            const referenceAnswer = currentTask?.referenceAnswer;
            if (option.value === referenceAnswer) {
                this.nextTask(option.value);
            } else {
                const { t, customOptions } = this.props;
                const correctAnswer = customOptions
                    .flatMap(customOption => [
                        {
                            value: customOption.value,
                            title: customOption.title,
                        },
                        ...(customOption.subOptions?.map(subOption => ({
                            value: subOption.value,
                            title: `${option.title} > ${subOption.description}`,
                        })) ?? []),
                    ])
                    .find(opt => opt.value === referenceAnswer);
                MessageBarManager.showAlert({
                    title: t('incorrectAnswerMessageTitle'),
                    message: t('incorrectAnswerMessage', {
                        correctAnswer: correctAnswer?.title,
                    }),
                    alertType: 'warning',
                });
            }
        }
        return true;
    };

    handleClose = () => {
        this.setState(prevState => ({
            ...prevState,
            subOptionHeading: '',
            showSubOptions: false,
            subOptions: [],
        }));
    };

    handleAdditionalOptionClick = value => {
        this.nextTask(value);
        this.handleClose();
    };

    nextTask = (result: ?number): boolean => {
        // update state to point to the next task in the list, and
        // save result if one was provided.
        // Return a bool indicating whether we've reached the end of
        // the array of tasks
        const { completeGroup, group, submitResult, tutorial, updateProgress } =
            this.props;
        const { currentTaskIndex } = this.state;
        if (result !== null && result !== undefined) {
            // the user tapped a button, save result and update how far
            // we've worked
            submitResult(result, this.expandedTasks[currentTaskIndex].taskId);
            if (currentTaskIndex > this.tasksDone) {
                this.tasksDone = currentTaskIndex;
            }
        } else if (currentTaskIndex > this.tasksDone) {
            // no result provided, the user just tried to swipe forward
            // past the last task completed, just ignore this swipe
            // but return true to indicate we can't go any further
            return true;
        }
        if (currentTaskIndex + 1 >= this.expandedTasks.length) {
            // no more tasks in the group, show the "LoadMore" screen
            updateProgress((1 + currentTaskIndex) / group.numberOfTasks);
            if (tutorial && this.flatlist) {
                // we've gone through all the tutorial tasks, move on
                // to the tutorial outro screens which are just after the
                // main screen with examples (hence the +1 below)
                this.scrollEnabled = true;
                this.flatlist.scrollToOffset({
                    offset: GLOBAL.SCREEN_WIDTH * (this.tutorialIntroWidth + 1),
                });
                this.forceUpdate(); // to pickup the change in scrollEnabled
            } else {
                completeGroup();
            }
            return false;
        }
        updateProgress((1 + currentTaskIndex) / group.numberOfTasks);
        this.setState(prevState => ({
            currentTaskIndex: prevState.currentTaskIndex + 1,
        }));
        return currentTaskIndex >= this.tasksDone;
    };

    onMomentumScrollEnd = (event: Object) => {
        this.currentScreen = Math.round(
            event.nativeEvent.contentOffset.x / GLOBAL.SCREEN_WIDTH -
                this.tutorialIntroWidth,
        );
        if (this.currentScreen >= 0) {
            // this is hacky, but the FlatList doesn't get rerendered here
            // until the user taps a button on the "action" screen, so scrollEnabled
            // doesn't pick up that it should be false. This makes sure it checks the
            // prop again
            this.forceUpdate();
        }
    };

    previousTask = (): boolean => {
        // update state to point to the previous task and return a
        // bool indicating whether we've reached the end of the array of tasks
        const { group, updateProgress } = this.props;
        const { currentTaskIndex } = this.state;
        if (currentTaskIndex > 0) {
            updateProgress((currentTaskIndex - 1) / group.numberOfTasks);
            this.setState({ currentTaskIndex: currentTaskIndex - 1 });
            return false;
        }
        return true;
    };

    renderOptions = selectedOption => {
        const { showSubOptions, subOptions, subOptionHeading } = this.state;
        const { customOptions } = this.props;

        const isSelected = item => {
            if (isDefined(selectedOption)) {
                return (
                    selectedOption === item.value ||
                    (item.subOptions?.some(
                        subOption => subOption.value === selectedOption,
                    ) ??
                        false)
                );
            }
            return false;
        };
        if (showSubOptions) {
            return (
                <View style={styles.listItem}>
                    <View style={styles.listHeader}>
                        <Text style={styles.listHeading}>
                            {subOptionHeading}
                        </Text>
                        <Pressable onPress={this.handleClose} hitSlop={5}>
                            <View style={styles.closeButton}>
                                <SvgXml
                                    xml={SvgIcons.redCross}
                                    width="100%"
                                    height="100%"
                                />
                            </View>
                        </Pressable>
                    </View>
                    <FlatList
                        data={subOptions}
                        renderItem={({ item }) => (
                            <TouchableHighlight
                                style={styles.itemContainer}
                                key={item.value}
                                underlayColor="#f0f0f0"
                                onPress={() =>
                                    this.handleAdditionalOptionClick(item.value)
                                }
                            >
                                <View style={styles.item}>
                                    <View style={styles.selectedIcon}>
                                        {isDefined(selectedOption) &&
                                            item.value === selectedOption && (
                                                <SvgXml
                                                    xml={
                                                        SvgIcons.checkmarkGreenOutline
                                                    }
                                                    width="100%"
                                                    height="100%"
                                                />
                                            )}
                                    </View>
                                    <Text style={styles.listItemText}>
                                        {item.description}
                                    </Text>
                                </View>
                            </TouchableHighlight>
                        )}
                    />
                </View>
            );
        }
        return (
            <View style={styles.options}>
                {customOptions?.map(item => (
                    <View style={styles.option} key={item.value}>
                        <RoundButtonWithTextBelow
                            key={item.value}
                            color={item.iconColor}
                            iconXmlString={
                                SvgIcons[toCamelCase(item.icon)] ??
                                SvgIcons.removeOutline
                            }
                            label={item.title}
                            onPress={() => this.handleSelectOption(item)}
                            radius={buttonHeight}
                            selected={isSelected(item)}
                        />
                    </View>
                ))}
            </View>
        );
    };

    /* eslint-disable global-require */
    renderValidator = () => {
        const { group, results, screens, tutorial } = this.props;
        const { currentTaskIndex } = this.state;
        const currentTask = this.expandedTasks[currentTaskIndex];

        if (currentTask === undefined) {
            return <LoadingIcon label="Loading tasks" />;
        }
        const selectedResult = results?.[currentTask?.taskId];

        let tutorialContent: ?TutorialContent;
        const tutorialMode = tutorialModes.instructions;
        if (tutorial && group.tasks) {
            if (currentTaskIndex >= this.expandedTasks.length) {
                // we've reached the end, hide the tutorial text
                tutorialContent = undefined;
            } else {
                const currentScreen = this.getCurrentScreen();
                if (currentScreen >= 0) {
                    tutorialContent =
                        // $FlowFixMe
                        screens?.[currentTaskIndex]?.[tutorialMode];
                } else {
                    tutorialContent = null;
                }
            }
        }

        // NOTE: -1 is done because startTime is added in results by default
        let totalSwipedTasks = 0;
        if (results) {
            totalSwipedTasks = Object.keys(results).length;
            if ('startTime' in results) {
                totalSwipedTasks -= 1;
            }
        }

        return (
            <View style={styles.container}>
                <Tasks
                    tasks={this.expandedTasks}
                    totalSwipedTasks={totalSwipedTasks}
                    selectedResult={selectedResult}
                    onCurrentTaskIndexChange={newIndex => {
                        this.setState({ currentTaskIndex: newIndex });
                    }}
                    currentTaskIndex={currentTaskIndex}
                />
                {this.renderOptions(selectedResult)}
                {tutorial &&
                    tutorialContent &&
                    this.getCurrentScreen() >= 0 && (
                        <TutorialBox
                            content={tutorialContent}
                            boxType={tutorialModes.instructions}
                            bottomOffset="45%"
                            topOffset="5%"
                        />
                    )}
            </View>
        );
    };

    render = () => {
        const {
            group,
            navigation,
            tutorial,
            informationPages,
            customOptions,
            project,
        } = this.props;

        const { projectId } = group;
        if (!this.expandedTasks) {
            return <LoadingIcon label="Loading tasks" />;
        }

        if (tutorial) {
            // in tutorial mode, we embed the validator component in
            // a flatlist so that we can scroll through the intro/outro
            // screens
            return (
                <>
                    <FlatList
                        data={[true]}
                        horizontal
                        initialNumToRender={1}
                        ListFooterComponent={
                            <TutorialEndScreen
                                group={group}
                                navigation={navigation}
                                OutroScreen={TutorialOutro}
                                outroScreenProps={{
                                    firstOption: customOptions?.[0],
                                }}
                                projectId={projectId}
                            />
                        }
                        ListHeaderComponent={
                            <TutorialIntroScreen
                                title={project.lookFor}
                                tutorial={tutorial}
                                informationPages={informationPages}
                                customOptions={customOptions}
                            />
                        }
                        onMomentumScrollEnd={this.onMomentumScrollEnd}
                        // eslint-disable-next-line no-return-assign
                        ref={r => (this.flatlist = r)}
                        renderItem={this.renderValidator}
                        pagingEnabled
                        scrollEnabled={
                            this.scrollEnabled || this.getCurrentScreen() < 0
                        }
                        windowSize={50}
                    />
                </>
            );
        }
        // if not in tutorial, we don't need the FlatList at all
        // so we just render the validator directly
        return this.renderValidator();
    };
}

const mapStateToProps = (state, ownProps) => ({
    commitCompletedGroup: ownProps.commitCompletedGroup,
    group: ownProps.group,
    project: ownProps.tutorial
        ? {
              // use the tutorial imagery when in tutorial mode
              ...ownProps.project,
              tileServer:
                  state.firebase.data.tutorial[ownProps.tutorialId].tileServer,
          }
        : ownProps.project,
    results: get(
        state.results[
            ownProps.tutorial ? ownProps.tutorialId : ownProps.project.projectId
        ],
        ownProps.group.groupId,
        null,
    ),
    tutorial: ownProps.tutorial,
    submitResult: ownProps.submitResult,
});

export default (compose(
    withTranslation('CDValidator'),
    firebaseConnect(props => {
        if (!props.group) {
            return [];
        }

        const { groupId, projectId } = props.group;
        const prefix = props.tutorial ? 'tutorial' : 'projects';
        if (groupId === undefined) {
            return [];
        }

        return [
            {
                type: 'once',
                path: `v2/tasks/${projectId}/${groupId}`,
                storeAs: `${prefix}/${projectId}/groups/${groupId}/tasks`,
            },
        ];
    }),
    connect(mapStateToProps),
)(_Validator): any);

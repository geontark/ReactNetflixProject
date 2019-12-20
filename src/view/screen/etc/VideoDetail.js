import React from 'react';
import {
    StyleSheet,
    ScrollView,
    View,
    Text,
    StatusBar,
    Component,
    FlatList,
    Image,
    ImageBackground,
    TouchableOpacity,
    Modal,
    TouchableHighlight,
    PixelRatio,
    Button,
    Share,
    ToastAndroid
} from 'react-native';
import ShareBtn from '../../module/ShareBtn';
import DibsBtn from '../../module/DibsBtn';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AppStyle from '../../../style/AppStyle';
import StringUtil from './StringUtil';
import dummy from '../../../dummy/dummy';

randomNumber = 4;
// 영화 상세 정보 API : https://api.themoviedb.org/3/movie/{movie_id}?api_key=bc1ebe6e0dd688063e0bbf7d331610dc&language=en-US


// const { navigation } = this.props;
// const movie_id = navigation.getParam("movie_id");

class VideoDetail extends React.Component {
    // const { navigation } = this.props;
    // ToastAndroid.show("ID:"+navigation.getParam("movie_id"), ToastAndroid.LONG)

    constructor(props){
        super(props);
        const { navigation } = this.props;

        this.getMovieInfo(navigation.getParam("movieId"));
        this.getPopularMoviesAsync();

        this.state = {
            seasonCount: dummy.videos[randomNumber].totalSeason,
            allowAge: dummy.videos[randomNumber].allowAge,
            resolution: dummy.videos[randomNumber].videoQuality,
            isLike: dummy.videos[randomNumber].myState.evaluate,
            isDibs: dummy.videos[randomNumber].myState.isDibs,
            isEsteem: 1,
            esteem: 1,
            downloadVisible: false,
            // 시즌 별 리스트 데이터
            seasonInfo : dummy.videos[randomNumber].seasonInfo,
            // subTab api 따로
            subTab: ["회차정보", "비슷한 컨텐츠"],
            visibleList: "similar",
            visibleModal: false,
        };
    }

    getMovieInfo(movieId) {
        return fetch('https://api.themoviedb.org/3/movie/' + movieId + '?api_key=bc1ebe6e0dd688063e0bbf7d331610dc&language=en-US')
          .then((response) => 
          response.json())
          .then((responseJson) => {
            // 제목
            const title = responseJson.title;  
            // 이미지
            const poster = "https://image.tmdb.org/t/p/w500" + responseJson.poster_path;
            // 장르
            const genres = responseJson.genres; 
            let genresName = '';
            for(let i = 0 ; i< genres.length;i++){
                if(i == genres.length -1){
                    genresName += genres[i].name;
                }else{
                    genresName += genres[i].name + ", "; 
                }
            }
            const overview = responseJson.overview; // 줄거리
            const releaseDate = responseJson.release_date.substring(0,4);  // 출시일
            const runtime = responseJson.runtime +" min";   // 영상 시간
            const voteAverage = responseJson.vote_average;   // 평점
            // const popularity = responseJson.popularity;   // 인기도
            this.setState({
                backgroundImg: poster,
                year : releaseDate,
                title : title,
                subTitle : overview,
                sameRate : voteAverage,
                genres : genresName,
                runtime : runtime
            });
            // ToastAndroid.show(responseJson.overview+"", ToastAndroid.LONG);
        })       
      }

      getPopularMoviesAsync() {
        let random = Math.floor(Math.random() * 500) + 1 ;
          return fetch('https://api.themoviedb.org/3/movie/popular?api_key=bc1ebe6e0dd688063e0bbf7d331610dc&language=en-US&page='+random)
          .then((response) => response.json())
          .then((responseJson) => {
            let result = responseJson.results;
            let length = result.length;
            let imgs = [];
            for(let i = 0; i <length; i++){
                let path = "https://image.tmdb.org/t/p/w500" + result[i].poster_path;
                imgs.push({"thumbNail" :  path});
            }

              this.setState({
                similarVideList : imgs
              });
    })
}

    isVideoList = (visibleList) => {
        let visibleName;
        switch (visibleList) {
            case "series":
                visibleName = "series";
                break;

            case "similar":
                visibleName = "similar";
                break;
        }

        this.setState({
            visibleList: visibleName
        });
    };


    // //  영화 관람 화면 으로 이동
    theaterMove = () =>{
        this.props.navigation.navigate('VideoTheater');
    };

    videoLike = () => {
        this.setState({
            isLike: !(this.state.isLike)
        });
    };

    visibleModal = () => {
        this.setState({
            visibleModal: !(this.state.visibleModal)
        });
    }

    onShare = async () => {
        try {
            const result = await Share.share({
                message:
                    'React Native | A framework for building native apps using React',
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            alert(error.message);
        }
    };

    
    render() {
        //  오름차순
        function sortAscending(list, keyword) {
            return list.sort(function (a, b) {
                return a[keyword] - b[keyword];
            });
        };

        //    내림차순
        function sortDescending(list, keyword) {
            return list.sort(function (a, b) {
                return b[keyword] - a[keyword];
            });
        };

        //   분 -> 2시간 10분
        function minConvertPlayTime(min) {
            let resultHour = parseInt((min / 60));
            let resultMin = min % 60;

            if (resultHour > 0) {
                return resultHour + StringUtil.TIME + " " + resultMin + StringUtil.MINUTE;
            }
            return resultMin + StringUtil.MINUTE;
        }

        //   비디오 목록 정렬
        if(this.state.seasonInfo != null){
            sortAscending(this.state.seasonInfo, "part");
            this.state.seasonInfo.forEach(function (season) {
                sortAscending(season.playList, "sequence");
            });
        }

        return (
            <View style={AppStyle.flexCC}>
                <ScrollView>
                    <View  style={[AppStyle.absolute, { height: 350, width: '100%' }]}>
                    <TouchableOpacity onPress={() => this.theaterMove()}>
                        <Image source={{ uri: this.state.backgroundImg }} style={{ resizeMode: 'contain', width: '100%', height: 350 }}></Image>
                        <View style={[AppStyle.absolute, { top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }]}>
                            <Ionicons name="ios-play-circle" size={100} color={AppStyle.white} >
                            </Ionicons>
                        </View>
                        </TouchableOpacity>
                    </View>
                

                    <View style={[style.container, AppStyle.basePadding, { marginTop: 350 }]}>
                        <View style={[style.descriptonContainer]}>
                            <Text style={style.title}>
                                {this.state.title}
                            </Text>
                            <View style={AppStyle.flexRow}>
                                <Text style={AppStyle.green}>{this.state.sameRate}/10</Text>
                                <View style={[AppStyle.flexRow, { marginLeft: 10 }]}>

                                    <View>
                                        <Text style={style.videoInfo}>
                                            {this.state.year}
                                        </Text>
                                    </View>

                                    <View style={{ paddingLeft: 5 }}>
                                        <Text style={style.videoInfo}>
                                            {this.state.allowAge}
                                        </Text>
                                    </View>

                                    {
                                        this.state.seasonCount != null ? (
                                            <View style={{ paddingLeft: 5 }}>
                                                <Text style={style.videoInfo}>
                                                    시즌{this.state.seasonCount} 개</Text>
                                            </View>
                                        ) : null
                                    }

                                    <View style={{ paddingLeft: 5 }}>
                                        <Text style={[style.videoInfo, AppStyle.fb]}>
                                            {this.state.runtime}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <View>
                            <View style={{ paddingLeft: 5 }}>
                                        <Text style={[style.videoInfo, AppStyle.fb]}>
                                            {this.state.genres}
                                        </Text>
                                        </View>
                            </View>

                                    {/* 영화 줄거리 및 서브 타이틀 텍스트 표시 */}
                            <View style={[{ marginTop: 10, marginBottom: 10 }]}>
                                {this.state.subTitle != null ? (
                                    <Text style={style.subTitle}>
                                        {this.state.subTitle}
                                    </Text>
                                ) : null}

                                {this.state.summary != null ? (
                                    <Text style={[style.summary, { marginTop: 5 }]}>
                                        {this.state.summary}
                                    </Text>
                                ) : null}
                            </View>

                            {/* 찜하기 버튼  */}
                            <View style={AppStyle.flexRow}>
                                {/* <DibsBtn isDibs ={this.state.isDibs}></DibsBtn> */}

                                <TouchableOpacity onPress={() => this.videoLike()}>
                                    <View style={[style.iconBtn, AppStyle.flexColumn, AppStyle.flexCC]}>
                                        {
                                            this.state.isLike ?
                                                (
                                                    <Ionicons name="ios-add" size={50} color={AppStyle.white} ></Ionicons>
                                                ) : <Ionicons name="ios-checkmark" size={50} color={AppStyle.white} ></Ionicons>
                                        }
                                        <Text style={style.iconBtnText}>
                                            {StringUtil.DIBS_CONTENT}
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => this.visibleModal()}>
                                    <View style={[style.iconBtn, { marginLeft: 20 }]} >
                                        <Ionicons name="ios-thumbs-up" size={50} color={AppStyle.white} ></Ionicons>
                                        <Text style={style.iconBtnText}>평가</Text>
                                    </View>
                                </TouchableOpacity>

                                {/*  좋아요 평가 모달창 */}
                                <Modal
                                    animationType="fade"
                                    transparent={true}
                                    overlayBackground={'rgba(0, 0, 0, 0.4)'}
                                    visible={this.state.visibleModal}
                                    onRequestClose={() => {
                                    }}
                                    onShow={() => {
                                    }}>
                                    <View style={{
                                        width: "100%",
                                        height: "100%",
                                        backgroundColor: 'rgba(255, 255, 255, 0.4)'
                                    }}>

                                        <View style={{
                                            position: 'absolute',
                                            left: "50%", top: "50%",
                                            marginLeft: -100, marginTop: -100,
                                            width: 200, height: 200
                                        }}>

                                            <View style={[AppStyle.flexCC]}>
                                                <View style={[AppStyle.flexRow, AppStyle.flexCSb, { width: '100%' }]}>
                                                    <Ionicons name="ios-thumbs-up" size={100} />
                                                    <Ionicons name="ios-thumbs-down" size={100} />
                                                </View>

                                                <TouchableOpacity onPress={() => {
                                                    this.setState({
                                                        visibleModal: false
                                                    })
                                                }}>

                                                    <Ionicons name="ios-close-circle" size={65} />

                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                </Modal>

                                {/* 공유하기 버튼 */}
                                <ShareBtn></ShareBtn>

                            </View>

                            <View style={[AppStyle.flexRow, { marginTop: 30 }]}>
                                {/* 회차정보 */}
                                {this.state.seasonCount != null ? (
                                    <TouchableOpacity onPress={() => this.isVideoList("series")}>
                                        <View>
                                                <Text
                                                    style={[
                                                        AppStyle.flexCC, AppStyle.white, AppStyle.textC,
                                                        {
                                                            width: 100
                                                        },
                                                        this.state.visibleList == "series" ?
                                                            {
                                                                borderTopColor: "red",
                                                                borderTopWidth: 1,
                                                            } : ''
                                                    ]}>
                                                    회차정보</Text>
                                        </View>
                                    </TouchableOpacity>
                                ) : null}

                                {/* 비슷한 컨텐츠 */}
                                {(this.state.similarVideList != null && this.state.similarVideList.length != 0) ? (
                                    <TouchableOpacity onPress={() => this.isVideoList("similar")}>
                                        <View>
                                            {
                                                <Text style={[
                                                    AppStyle.flexCC, AppStyle.white, AppStyle.textC,
                                                    {
                                                        width: 100,
                                                    },
                                                    this.state.visibleList == "similar" ?
                                                        {
                                                            borderTopColor: "red",
                                                            borderTopWidth: 1,

                                                        } : ''
                                                ]}>
                                                    비슷한 콘텐츠</Text>
                                            }
                                        </View>
                                    </TouchableOpacity>
                                ) : null}


                            </View>

                            {/* 시리즈 비디오 리스트 컨테이너*/}
                            {
                                (this.state.seasonCount != null && this.state.visibleList == "series") ? (
                                    <View>
                                        <View style={style.recommendMovieContainer}>
                                    <FlatList
                                                scrollEnabled={false}
                                                data={this.state.seasonInfo[0].playList}
                                                renderItem={({ item }) => (
                                                    <View style={[AppStyle.flexColumn, AppStyle.basePadding, { paddingTop: 20 }]}>
                                                        <View style={AppStyle.flexRow}>
                                                            <View style={[AppStyle.bgGray, style.iconBtn, { marginLeft: 20 }]}>
                                                                <Image
                                                                    style={[{ height: 100, width: 100 }]}
                                                                    source={{
                                                                        uri : item.thumbNail
                                                                    } }>
                                                                </Image>
                                                            </View>

                                                            <View style={[AppStyle.flexColumn, { marginLeft: 20 }]}>
                                                                <Text style={AppStyle.white}>
                                                                    {item.sequence}. {item.title}
                                                                </Text>
                                                                <Text style={AppStyle.gray}>
                                                                    {minConvertPlayTime(item.playTime)}
                                                                </Text>
                                                            </View>
                                                        </View>

                                                        <View style={[AppStyle.gray, { marginTop: 20 }]}>
                                                            <Text style={[AppStyle.basePadding, AppStyle.gray, { marginTop: 3 }]}>
                                                                {item.summary}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                )} />
                                        </View>
                                    </View>)
                                    : null
                            }

                            {/* 비슷한 콘텐츠 */}
                            {(this.state.similarVideList != null && this.state.visibleList == "similar") ? (
                                <View style={style.recommendMovieContainer}>
                                    <FlatList
                                        scrollEnabled={false}
                                        numColumns={3}
                                        data={this.state.similarVideList}
                                        renderItem={({ item }) => (
                                            <View style={[AppStyle.flexCFs, { width: 110, height: 160 }]}>
                                                <Image style={{
                                                    height: 150,
                                                    width: 100,
                                                    resizeMode: 'contain'
                                                }} source={{uri : item.thumbNail}}>
                                                </Image>
                                            </View>
                                        )} />
                                </View>
                            ) : null}

                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    }
}

const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "black",
        opacity: 0.9
    },

    videoContainer: {
        flex: 1,
        backgroundColor: "green"
    },

    descriptonContainer: {
        flex: 1,
        marginTop: 10
    },

    videoDescriptonContainer: {
        flex: 1,
        backgroundColor: "blue"
    },

    videoInfo: {
        color: 'gray',
        opacity: .84,
    },
    title: {
        color: "white",
        fontSize: 20,
        fontWeight: 'bold',
    },
    subTitle: {
        color: "white",
        fontSize: 15,
        fontWeight: 'bold',
    },

    summary: {
        color: "white",
        fontSize: 13,
    },


    //  좋아요 버튼 영역 
    iconBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: "column",
        width: 110,
        height: 80,
        backgroundColor: "white"
    },
    iconBtnImg: {
        width: 40,
        height: 40,
        backgroundColor: "white"
    },
    iconBtnText: {
        fontWeight: 'bold',
        color: "black",
        marginTop: 3
    },

    // top의 이미지 영역
    homeBackgroundContainer: {
        position: 'absolute',
        width: '100%',
    },
    homeBackgroundImg: {
        position: 'absolute',
        width: '100%',

    },

    // 리스트
    recommendMovieContainer: {
        justifyContent: 'center',
        flex: 1,
        paddingTop: 30,
    },
    imageThumbnail: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 100,
        width: 100,
        resizeMode: 'contain',
    },
});

export default VideoDetail;
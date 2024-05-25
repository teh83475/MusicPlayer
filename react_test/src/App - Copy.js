import React from 'react';
import ReactDOM from 'react-dom';
import logo from './logo.svg';
import $ from 'jquery';
import './App.css';

class App extends React.Component {
  constructor(props) {
		super(props);
		this.state = {
			songs:[],
      current:null
		};
  }

  init(){
    
    var compo=this;
    $.get('http://localhost:8081/getsong', function(data) {
      //alert(JSON.stringify(data));
      compo.setState({songs: data})
    });
	}
	
	componentDidMount() {
		this.init();
	}

  setCurrentSong(song){
    this.setState({current: song})
    //alert("top");
  }

  render(){
    return (
      <div className="App">
        <header/>
  
        <TopNav/>
        <div className="main">
          <SideBar/>
          <MainSongSelect songs={this.state.songs} setCurrentSong={this.setCurrentSong.bind(this)}/>
        </div>
        
        <Control current={this.state.current}/>
        
        
      </div>
    );
  }
}



class Control extends React.Component{
  constructor(props){
    super(props);

    this.state={
      volume: 50,
      progress:0,
      music: null,
      duration: 0,
      playing: false
    };

    
    
    
    
    this.handleVolumeChange=this.handleVolumeChange.bind(this);
    this.handleProgressChange=this.handleProgressChange.bind(this);
    this.playPause=this.playPause.bind(this);


    this.progress_slider = React.createRef();
  }

  componentDidMount() {
    

    
    //alert(this.state.music.duration);
	}

  componentDidUpdate(){
    
    if (this.props.current){
      //alert("update")
      
      
      var newAudio=new Audio("http://127.0.0.1:8081/musics/"+this.props.current.filename)
      
      newAudio.preload="metadata";
      newAudio.onloadedmetadata=()=>this.setDuration();
      newAudio.ontimeupdate=()=>this.audioTimeUpdate();
      newAudio.volume=this.state.volume/100;
      
      this.state.music=newAudio;
    }
  }

  setDuration(){
    
    this.setState({duration: this.state.music.duration});
  }

  audioTimeUpdate(){
    this.setState({progress: this.state.music.currentTime});
    
    this.progress_slider.current.value=this.state.music.currentTime;
    if (this.state.music.currentTime>=this.state.music.duration){
      this.setState({playing: false});
      alert("end");
    }
    //this.state.progress_bar.value=this.state.music.currentTime;
  }
  
  handleVolumeChange(event){
    if (this.props.current){
      this.setState({volume: event.target.value});
      this.state.music.volume=event.target.value/100;
    }
    
  }

  handleProgressChange(event){
    if (this.props.current){
      this.setState({progress: event.target.value});
      this.state.music.currentTime=event.target.value;
    }
    
  }

  playPause(){
    if (this.props.current){
      
      if (this.state.playing){
        //alert("playing");
        this.state.music.pause()
        this.setState({playing: false});
      } else {
        //alert("not playing");
        this.state.music.play()
        this.setState({playing: true});
      }
    }

  }


  render(){
    var songinfo=""
    if (this.props.current){
      songinfo=" "+this.props.current.title+" | "+this.props.current.singer;
    }
    
    return (
      <div className="col-12">
        <div className="music-info col-2">
          &ensp;{songinfo}
        </div>

        <div className="progress-control col-8">
          <button className="play-pause-button"onClick={()=> this.playPause()}>{this.state.playing? "Pause": "Play"}</button>
          <input type="range" ref={this.progress_slider} min="0" max={this.state.duration} defaultValue="0" className="progress-slider" onChange={this.handleProgressChange}/>
          <div className="progress-display">{convertDuration(this.state.progress)}/{convertDuration(this.state.duration)}</div>
        </div>

        <div className="volume-control col-2">
          <div className="volume-title">Volume:</div>
          <input type="range" min="0" max="100" defaultValue="50" className="volume-slider" onChange={this.handleVolumeChange}/>
          <div className="volume-number-display">{this.state.volume}</div>
        </div>

        
      </div>
    );
  }
}

class TopNav extends React.Component{
  render(){

    return (
      <div className='top-nav col-12'>
        
      </div>
    );
  }
}

class LoginBlock extends React.Component{



  render(){

    return (
      <div className="login-block" >
        
        Username: <input type="text" id="userNameInput"></input><br/>
        Password: <input type="password" id="passwordInput"></input><br/>
        <div><button className="Button" variant="contained" color="primary" >Login</button></div>
      </div>
    );
  }
}

class SideBar extends React.Component{
  constructor(props){
    super(props);
    
  }
  


  render(){

    return (
      <div className="col-2 sidebar">
        <ul>
          <li><CollectionItem title="Song Title"  singer="Song Singer"/></li>
        </ul>
      </div>
    );
  }
}

class MainSongSelect extends React.Component{
  constructor(props){
    super(props);
    
  }
  


  render(){
    var listItems=this.props.songs.map((song,index) =><li key={song._id}><MusicItem content={song} setCurrentSong={this.props.setCurrentSong}/></li>)
    return (
      <div className="col-10 main-song-select">
        <ul>
          {listItems}
        </ul>
      </div>
    );
  }
}

class CollectionItem extends React.Component{
  constructor(props){
    super(props);
    
  }
  
  render(){

    return (
      <div className="collection-item">
        <div className="collection-item-title">&ensp;{this.props.title}</div>
        <div className="collection-item-count">&ensp;No. of songs:&ensp; {"testing"}</div>
      </div>
    );
  }
}

class MusicItem extends React.Component{
  constructor(props){
    super(props);
    
  }
  
  changeSong(){
    //alert("clicked");
    this.props.setCurrentSong(this.props.content);
  }

  render(){

    return (
      <div className="music-item" onClick={()=>this.changeSong()}>
        <div className="music-item-title">&ensp;{this.props.content.title}</div>
        <div className="music-item-singer">&ensp;{this.props.content.singer}&ensp;</div>
      </div>
    );
  }
}



function convertDuration(duration){
  if (isNaN(duration)){
    duration=0;
  }
  return String(Math.floor(duration/60))+":"+String(Math.floor(duration%60)).padStart(2, '0');
}


export default App;

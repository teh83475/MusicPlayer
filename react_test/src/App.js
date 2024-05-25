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
      collections:[],
      current:null,
      current_no:null,
      audio: null,
      displayPopUp: false
		};
  }

  init(){
    this.getSong();
    this.getCollection();
	}

  getSong(){
    var compo=this;
    $.get('http://localhost:8081/getsong', function(data) {
      //alert(JSON.stringify(data));
      compo.setState({songs: data})
    });
  }

  getCollection(){
    var compo=this;
    $.get('http://localhost:8081/getcollection', function(data) {
      //alert(JSON.stringify(data));
      compo.setState({collections: data})
    });
  }
	
	componentDidMount() {
		this.init();
	}

  setCurrentSong(id){
    this.setState({
      current: this.state.songs[id],
      current_no: id
    })
    if (this.state.audio){
      if (!this.state.audio.paused){
        this.state.audio.pause();
      }
    }
    

    this.state.audio=new Audio("http://127.0.0.1:8081/musics/"+this.state.songs[id].filename);
    this.state.audio.play();
    //alert("top");
  }

  nextSong() {
		//alert("next");
    this.setCurrentSong((this.state.current_no+1)%this.state.songs.length);
	}

  addToCollection(id){
    this.setState({displayPopUp: true })
  }

  addToCollectionCancel(){
    this.setState({displayPopUp: false })
  }

  render(){
    return (
      <div className="App">
        <header/>
  
        <TopNav/>
        <div className="main">
          <SideBar collections={this.state.collections}/>
          <MainSongSelect songs={this.state.songs} setCurrentSong={this.setCurrentSong.bind(this)} addToCollection={this.addToCollection.bind(this)}/>
        </div>
        
        <Control current={this.state.current} audio={this.state.audio} nextsong={this.nextSong.bind(this)}/>
        
        {this.state.displayPopUp? <AddToCollectionPopUp  addToCollectionCancel={this.addToCollectionCancel.bind(this)}/>:""}
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
      playing: true
    };

    
    
    
    
    this.handleVolumeChange=this.handleVolumeChange.bind(this);
    this.handleProgressChange=this.handleProgressChange.bind(this);
    this.playPause=this.playPause.bind(this);


    this.progress_slider = React.createRef();
  }

  componentDidMount() {
    
	}

  componentDidUpdate(){
    
    if (this.props.audio){
      //alert("update")
      //var newAudio=new Audio("http://127.0.0.1:8081/musics/"+this.props.current.filename)
      
      this.props.audio.preload="metadata";
      this.props.audio.onloadedmetadata=()=>this.setDuration();
      this.props.audio.ontimeupdate=()=>this.audioTimeUpdate();
      this.props.audio.volume=this.state.volume/100;
      
      //this.state.music=newAudio;
    }
  }

  setDuration(){
    this.setState({duration: this.props.audio.duration});
  }

  audioTimeUpdate(){
    this.setState({
      progress: this.props.audio.currentTime,
      playing: !this.props.audio.paused
    });
    
    this.progress_slider.current.value=this.props.audio.currentTime;
    if (this.props.audio.currentTime>=this.state.duration){
      this.setState({playing: false});
      this.props.nextsong();
      //alert("end");
    }
    //this.state.progress_bar.value=this.state.music.currentTime;
  }
  
  handleVolumeChange(event){
    if (this.props.audio){
      this.setState({volume: event.target.value});
      this.props.audio.volume=event.target.value/100;
    }
    
  }

  handleProgressChange(event){
    if (this.props.audio){
      this.setState({
        progress: event.target.value
      });
      this.props.audio.currentTime=event.target.value;
    }
    
  }

  playPause(){
    if (this.props.audio){
      
      if (this.state.playing){
        //alert("playing");
        this.props.audio.pause()
        this.setState({playing: false});
      } else {
        //alert("not playing");
        this.props.audio.play()
        this.setState({playing: true});
      }
    }

  }


  render(){
    var songinfo="No song selected"
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
    var listItems=this.props.collections.map((collection,index) =><li key={collection._id}><CollectionItem no={index} content={collection}/></li>)
    return (
      <div className="col-2 sidebar">
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
        <div className="collection-item-title">&ensp;{this.props.content.name}</div>
        <div className="collection-item-count">&ensp;No. of songs:&ensp; {this.props.content.list.length}</div>
      </div>
    );
  }
}

class MainSongSelect extends React.Component{
  constructor(props){
    super(props);
    
  }
  


  render(){
    var listItems=this.props.songs.map((song,index) =><li key={song._id}><MusicItem no={index} content={song} setCurrentSong={this.props.setCurrentSong} addToCollection={this.props.addToCollection}/></li>)
    return (
      <div className="col-10 main-song-select">
        <ul>
          {listItems}
        </ul>
      </div>
    );
  }
}

class MusicItem extends React.Component{
  constructor(props){
    super(props);
    
  }
  
  changeSong(event){
    //alert("clicked");
    if(event.target.tagName.toLowerCase()=="div"){
      this.props.setCurrentSong(this.props.no);
    }
  }

  add(){
    this.props.addToCollection(this.props.no);
  }
  

  render(){

    return (
      <div className="music-item" onClick={(e)=>this.changeSong(e)}>
        <div className="music-item-info">
          <div className="music-item-title">&ensp;{this.props.content.title}</div>
          <div className="music-item-singer">&ensp;{this.props.content.singer}&ensp;</div>
        </div>
        <div className="music-item-action">
          <button onClick={()=>this.add()}>Add</button>
        </div>
        
      </div>
    );
  }
}

class AddToCollectionPopUp extends React.Component{
  constructor(props){
    super(props);
    
  }

  backgroundClicked(){
    this.props.addToCollectionCancel();
  }

  render(){

    return (
      <div>
        <div className="add-to-collection-pop-up-background" onClick={()=>this.backgroundClicked()}/>
        <div className="add-to-collection-pop-up">
          Choose collection:<br/>
          <select name="dropdown_list"></select>
        </div>
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

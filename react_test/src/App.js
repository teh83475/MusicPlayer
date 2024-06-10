import React from 'react';
import ReactDOM from 'react-dom';
import logo from './logo.svg';
import $ from 'jquery';
import './App.css';

//do to: maybe remove setPlayingCollection


class App extends React.Component {
  constructor(props) {
		super(props);
		this.state = {
      username: "",
			songs:[],
      collections:[],
      current_song:null,
      current_song_no:-1,
      playing_collection_no: -1,
      playing_collection: [],
      display_collection_no: -1,
      display_collection: [],
      audio: null,
      displayPopUp: false,
      song_to_add:""
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
    $.get('http://localhost:8081/getcollection?username='+this.state.username, function(data) {
      //alert(JSON.stringify(data));
      compo.setState({collections: data})  
      //-------------not good
      if (compo.state.playing_collection_no!==-1){
        var list=[];
        let i=0;
        for (i=0;i<compo.state.songs.length;i++){
          if (data[compo.state.playing_collection_no].list.indexOf(compo.state.songs[i].title) >=0){
            list.push(i);
          }
        }
        compo.setState({
          playing_collection: list
        });
      }
      if (compo.state.display_collection_no!==-1){
        var list=[];
        let i=0;
        for (i=0;i<compo.state.songs.length;i++){
          if (data[compo.state.display_collection_no].list.indexOf(compo.state.songs[i].title) >=0){
            list.push(i);
          }
        }
        compo.setState({
          display_collection: list
        });
      }


    });//.done(compo.setPlayingCollection(compo.state.playing_collection_no));
    return;
  }
	
	componentDidMount() {
		this.init();
	}

  login(name,pw){
    var compo=this;
    alert(name+pw);
    $.post('http://localhost:8081/login',{username:name,password: pw}, function(data) {
      //alert(JSON.stringify(data));
      if (data!=="Failed"){
        
        compo.setState({
          username: data
        }, function(){
          compo.getCollection();
        });
      }
      alert(data);
    });
  }

  logout(){
    var compo=this;
    $.get('http://localhost:8081/logout', function(data) {
      //alert(JSON.stringify(data));
      compo.setState({
        username: "",
        playing_collection_no: -1,
        playing_collection: [],
        display_collection_no: -1,
        display_collection: []

      }, function(){
        compo.getCollection();
      });
      alert(data);
    });
  }

  setCurrentSong(id,change_playing_collection){
    if (change_playing_collection){
      this.setState({
        playing_collection_no: this.state.display_collection_no,
        playing_collection: this.state.display_collection
      });
    }
    this.setState({
      current_song: this.state.songs[id],
      current_song_no: id
    });
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
    let next=0;
    if (this.state.playing_collection_no===-1){
      next=(this.state.current_song_no+1)%this.state.songs.length;
    } else {
      next=this.state.playing_collection[(this.state.playing_collection.indexOf(this.state.current_song_no)+1)%this.state.playing_collection.length];
    }
    
    this.setCurrentSong(next,false);
	}

  setPlayingCollection(id){//maybe can remove(change to same as display)
    //alert(this.state.collections[id].list);
    
    console.log(this.state.collections[id]);
    if (id!==-1){
      var list=[];
      let i=0;
      for (i=0;i<this.state.songs.length;i++){
        if (this.state.collections[id].list.indexOf(this.state.songs[i].title) >=0){
          list.push(i);
          //alert(list);
        }
      }
      this.setState({
        playing_collection_no: id,
        playing_collection: list
      })
    }
    
    
    
  }

  setDisplayCollection(id,disableGoBack){
    if (this.state.display_collection_no===id && !disableGoBack){
      this.setState({
        display_collection_no: -1,
        display_collection: []
      })
    }else{
      var list=[];
      let i=0;
      for (i=0;i<this.state.songs.length;i++){
        if (this.state.collections[id].list.indexOf(this.state.songs[i].title) >=0){
          list.push(i);
          //alert(list);
        }
      }
      this.setState({
        display_collection_no: id,
        display_collection: list
      })
    }
  }

  addToCollectionShow(id){
    if (this.state.username!==""){
      this.setState({
        displayPopUp: true,
        song_to_add: this.state.songs[id].title
      })
    } else alert("Please login first.")
    
  }

  addToCollectionCancel(){
    this.setState({
      displayPopUp: false,
      song_to_add: ""
    })
  }

  addToCollection(collection_name){//not done
    if (this.state.username!==""){
      alert(collection_name);
      var compo=this;
      $.post('http://localhost:8081/addtocollection',{username:this.state.username,song: this.state.song_to_add, collection: collection_name}, function(data) {
        //alert(JSON.stringify(data));
        alert(data);
      });

      this.getCollection();
      this.addToCollectionCancel()
    } else alert("Please login first.");
    
  }

  removeFromCollection(song_no){//not done
    if (this.state.username!==""){
      var compo=this;
      $.post('http://localhost:8081/removefromcollection',{username:this.state.username,song: this.state.songs[song_no].title, collection: this.state.collections[this.state.display_collection_no].name}, function(data) {
        //alert(JSON.stringify(data));
        alert(data);
      });

      this.getCollection();
    } else alert("Please login first.");
    
    
  }

  newCollection(name){
    alert(name);
    
    if (this.state.username!==""){
      var compo=this;
      $.post('http://localhost:8081/newcollection',{username:this.state.username,collection_name: name}, function(data) {
        //alert(JSON.stringify(data));
        alert(data);
      });

      this.getCollection();
    } else alert("Please login first.");
    
  }

  removeCollection(){

    
    var name=this.state.collections[this.state.display_collection_no].name;
    alert(name);
    
    if (this.state.username!==""){
      var compo=this;
      $.post('http://localhost:8081/removecollection',{username:this.state.username,collection_name: name}, function(data) {
        //alert(JSON.stringify(data));
        alert(data);
      });
      this.setState({
        playing_collection_no: -1,
        display_collection_no: -1
      }, function(){
        compo.getCollection();
      });
      
    } else alert("Please login first.");
    
  }

  

  render(){
    return (
      <div className="App">
        <header/>
  
        <TopNav login={this.login.bind(this)} logout={this.logout.bind(this)} username={this.state.username}/>
        <div className="main">
          <SideBar collections={this.state.collections} playing_collection_no={this.state.playing_collection_no} display_collection_no={this.state.display_collection_no} setDisplayCollection={this.setDisplayCollection.bind(this)} setPlayingCollection={this.setPlayingCollection.bind(this)}  newCollection={this.newCollection.bind(this)}/>
          <MainSongSelect songs={this.state.songs} current_song_no={this.state.current_song_no} display_collection_no={this.state.display_collection_no} display_collection={this.state.display_collection} setCurrentSong={this.setCurrentSong.bind(this)} addToCollectionShow={this.addToCollectionShow.bind(this)} removeFromCollection={this.removeFromCollection.bind(this)} removeCollection={this.removeCollection.bind(this)}/>
        </div>
        
        <Control current_song={this.state.current_song} audio={this.state.audio} nextsong={this.nextSong.bind(this)}/>
        
        {this.state.displayPopUp? <AddToCollectionPopUp addToCollection={this.addToCollection.bind(this)}  addToCollectionCancel={this.addToCollectionCancel.bind(this)} collections={this.state.collections}/>:""}
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
    var title="No song selected";
    var singer=" ";
    if (this.props.current_song){
      title=this.props.current_song.title;
      singer=this.props.current_song.singer;
    }
    
    return (
      <div className="col-12 control" >
        <div className="music-info col-3">
          &ensp;{title}<br/>
          &ensp;{singer}
        </div>

        <div className="progress-control col-7">
          <button className="play-pause-button"onClick={()=> this.playPause()}>{this.state.playing? "Pause": "Play"}</button>
          <input type="range" ref={this.progress_slider} min="0" max={this.state.duration} defaultValue="0" className="progress-slider" onChange={this.handleProgressChange}/>
          <div className="progress-display">{convertDuration(this.state.progress)}/{convertDuration(this.state.duration)}</div>
          <br/>&ensp;
        </div>

        <div className="volume-control col-2">
          <div className="volume-title">Volume:</div>
          <input type="range" min="0" max="100" defaultValue="50" className="volume-slider" onChange={this.handleVolumeChange}/>
          <div className="volume-number-display">{this.state.volume}</div>
          <br/>&ensp;
        </div>

        
      </div>
    );
  }
}

class TopNav extends React.Component{
  render(){

    return (
      <div className='top-nav col-12'>
        {this.props.username!==""? <LogoutBlock logout={this.props.logout}/> :<LoginBlock login={this.props.login}/>}
        
      </div>
    );
  }
}

class LoginBlock extends React.Component{

  constructor(props){
    super(props);
    this.state={
      username:"",
      password:""
    };
  }

  handleUsernameChange(event){
    this.setState({
      username: event.target.value
    });
  }

  handlePasswordChange(event){
    this.setState({
      password: event.target.value
    });
  }

  render(){

    return (
      <div className="login-block" >
        <div className="input">
          Username: <input type="text" id="userNameInput"  onChange={this.handleUsernameChange.bind(this)}></input> <br/>
          Password: <input type="password" id="passwordInput"  onChange={this.handlePasswordChange.bind(this)}></input> 
        </div>
        
        <button className="Button" onClick={()=>this.props.login(this.state.username,this.state.password)}variant="contained" color="primary" >Login</button>
      </div>
    );
  }
}

class LogoutBlock extends React.Component{

  constructor(props){
    super(props);

  }


  render(){

    return (
      <div className="logout-block" >
        <br/>&ensp;        
        <button className="Button" onClick={()=>this.props.logout()} color="primary" >Logout</button>
      </div>
    );
  }
}

class SideBar extends React.Component{
  constructor(props){
    super(props);
    this.state={
      new_collection_mode:false,
      new_collection_name:""
    };
  }
  
  changeNewCollectionMode(){
    this.setState({
      new_collection_mode: !this.state.new_collection_mode
    });
  }

  handleNewCollectionNameChange(event){
    this.setState({
      new_collection_name: event.target.value
    });
  }

  render(){
    var listItems=this.props.collections.map((collection,index) =><li key={collection._id}><CollectionItem no={index} content={collection} playing_collection_no={this.props.playing_collection_no} display_collection_no={this.props.display_collection_no} setDisplayCollection={this.props.setDisplayCollection} setPlayingCollection={this.props.setPlayingCollection}/></li>)
    return (
      <div className="col-3 sidebar">
        <ul className="sidebar-list">
          {listItems}
        </ul>
        
        {this.state.new_collection_mode? <div className="sidebar-new-collection">
            <input type="text" className="sidebar-new-collection-text"onChange={this.handleNewCollectionNameChange.bind(this)}></input>
            <button onClick={()=>this.props.newCollection(this.state.new_collection_name)}>+</button>
            <button onClick={()=>this.changeNewCollectionMode()}>x</button>
          </div>
        : <button onClick={()=>this.changeNewCollectionMode()}>New</button>}
          
          
          
        
      </div>
    );
  }
}



class CollectionItem extends React.Component{
  constructor(props){
    super(props);
    
  }
  
  changeDisplayCollection(event){
    
    if(event.target.tagName.toLowerCase()==="div"){
      this.props.setDisplayCollection(this.props.no,false);
    }
  }

  render(){
    return (
      <div className={this.props.display_collection_no===this.props.no?"collection-item selected":"collection-item"} onClick={(e)=>this.changeDisplayCollection(e)}>
        
        <div className="collection-iten-info">
          <div className="collection-item-title">&ensp;{this.props.content.name}</div>
          <div className="collection-item-count">&ensp;No. of songs:&ensp; {this.props.content.list.length}</div>
        </div>
        <div className={this.props.playing_collection_no===this.props.no?"play-icon":"play-icon hidden"}>
          ▷&ensp;
        </div>
        
      </div>
    );
  }
}

class MainSongSelect extends React.Component{
  constructor(props){
    super(props);

  }
  
  
  render(){
    var listItems=this.props.songs.map((song,index) =>
      (this.props.display_collection.indexOf(index)>=0 || this.props.display_collection_no===-1)?   //this.props.playing_collection.indexOf(index)>=0?this.props.playing_collection.indexOf(index):
      (<li key={song._id}><MusicItem no={index} content={song}  display_collection_no={this.props.display_collection_no} current_song_no={this.props.current_song_no} setCurrentSong={this.props.setCurrentSong} addToCollectionShow={this.props.addToCollectionShow} removeFromCollection={this.props.removeFromCollection}/></li>): 
      ("")
    )
    return (
      <div className="col-9 main-song-select">

        <ul className="main-song-select-list">
          {listItems}
          
          
        </ul>
        {this.props.display_collection_no===-1?"":<button className="remove-collection-button"onClick={()=>this.props.removeCollection()}>Remove this collection</button>}
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
    if(event.target.tagName.toLowerCase()==="div"){
      this.props.setCurrentSong(this.props.no,true);
    }
  }

  add(){
    this.props.addToCollectionShow(this.props.no);
  }
  
  remove(){
    this.props.removeFromCollection(this.props.no)
  }

  render(){

    return (
      <div className={this.props.current_song_no===this.props.no?"music-item selected":"music-item"} onClick={(e)=>this.changeSong(e)}>
        <div className="music-item-info">
          <div className="music-item-title">&ensp;{this.props.content.title}</div>
          <div className="music-item-singer">&ensp;{this.props.content.singer}&ensp;</div>
        </div>
        <div className="music-item-action">
          {this.props.display_collection_no!==-1? <button onClick={()=>this.remove()}>Remove</button>:""}&ensp; 
          
          <button onClick={()=>this.add()}>Add</button> &ensp; 
        </div>
        
        
      </div>
    );
  }
}

class AddToCollectionPopUp extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      selected: "-"
    }
    
  }

  onDropDownListChange(event){
    
    this.setState({
      selected: event.target.value
    });
  }

  backgroundClicked(){
    this.props.addToCollectionCancel();
  }

  addButtonClicked(){
    if (this.state.selected!=="-"){
      this.props.addToCollection(this.state.selected);
    }
  }

  render(){
    var listItems=this.props.collections.map((collection,index) =><option value={collection.name} key={index}>{collection.name}</option>)
    
    return (
      <div>
        <div className="add-to-collection-pop-up-background" onClick={()=>this.backgroundClicked()}/>
        <div className="add-to-collection-pop-up">
          Choose collection:<br/>
          <select name="dropdown_list" onChange={(e)=>this.onDropDownListChange(e)}>
            <option value="-">-</option>
            {listItems}
          </select>
          <button onClick={()=>this.addButtonClicked()}>Add</button>
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

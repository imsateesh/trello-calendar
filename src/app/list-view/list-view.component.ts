import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGrigPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.css']
})
export class ListViewComponent implements OnInit {
  accessToken: string = null;
  apiKey = '352206beeb5228a44a7663d5304cb675';

  calendarPlugins = [dayGridPlugin, timeGrigPlugin, interactionPlugin, listPlugin];
  
  boards = [];
  lists = [];
  cards = [];

  ready = false;

  defaultView = 'calendar';

  listCounter = 0;
  cardCounter = 0;;

  listCategories: any = {
    'estimates': ['Estimates'],
    'toDo': ['To Do', 'Task List', 'Tasks List'],
    'inProgress': ['In Progress', 'Doing'],
    'techinfiniQa': ['QA - TechInfini','QA Staging - TechInfini'],
    'deyoQa': ['Quality Control', 'QA - Deyo',,'QA Staging - Deyo Group'],
    'pushToProduction': ['Push It', 'Approved for Production', 'Push to Production']
  };

  calendar = [];
  estimate = [];
  toDo = [];
  inProgress = [];
  techinfiniQa = [];
  deyoQa = [];
  pushToProduction = [];

  constructor(public http: HttpClient) {
    this.login();
  }

  ngOnInit() {

  }

  login() {
    if ( window['Trello'] ) {
      window['Trello'].authorize({
        type: 'popup',
        name: 'TechDeyo Tasks List',
        scope: {
          read: 'true',
          write: 'true'
        },
        expiration: 'never',
        success: () => { this.success() },
        error: () => function(){
          console.log('Couldn\'t authenticate.');
        },
      });
    } else {
      console.log('Trello does not exist.');
    }
  }

  success() {
    this.accessToken = window['Trello'].token();

    const path = `https://api.trello.com/1/members/me/boards?key=${this.apiKey}&token=${this.accessToken}`;

    this.http.get<any>(path).subscribe(boards => {
      this.boards = boards;
      this.getLists();
    });
  };

  failure() {
    console.log('Couldn\'t authenticate.');
  }

  getLists(){
    if ( (this.listCounter <= this.boards.length - 1) ) {
      let boardId = this.boards[this.listCounter].id;
      
      const path = `https://api.trello.com/1/boards/${boardId}/lists/?&key=${this.apiKey}&token=${this.accessToken}`;

      this.http.get<any>(path).subscribe(lists => {
        this.lists = this.lists.concat(lists);
        this.listCounter++;
        this.getLists();
      });
    } else {
      this.getCards();
    }
  }

  getCards() {
    if ( (this.cardCounter <= this.boards.length - 1) ) {
      let boardId = this.boards[this.cardCounter].id;

      const path = `https://api.trello.com/1/boards/${boardId}/cards/?fields=name,due,dueComplete,shortUrl,idBoard,idList,descData,des,idLabels&key=${this.apiKey}&token=${this.accessToken}`;

      this.http.get<any>(path).subscribe(cards => {
        this.cards = this.cards.concat(cards);
        this.cardCounter++;

        this.generateView();

        this.getCards();
      });
    }
  }

  getBoardName(id){
    let x = this.boards.findIndex(f => f.id == id);
    return x >= 0 ? this.boards[x].name : '';
  }

  getlistName(id){
    let x = this.lists.findIndex(f => f.id == id);
    return x >= 0 ? this.lists[x].name : '';
  }

  generateView(){
    this.clearData();

    this.cards.map(card => {
      card.labelBoard = this.getBoardName(card.idBoard);
      card.labelList = this.getlistName(card.idList);

      if( this.listCategories['estimates'].findIndex(d => d == card.labelList) >=0 ){
        this.estimate.push(card);
      }

      if( this.listCategories['toDo'].findIndex(d => d == card.labelList) >=0 ){
        this.toDo.push(card);
      }

      if( this.listCategories['inProgress'].findIndex(d => d == card.labelList) >=0 ){
        this.inProgress.push(card);
      }

      if( this.listCategories['techinfiniQa'].findIndex(d => d == card.labelList) >=0 ){
        this.techinfiniQa.push(card);
      }

      if( this.listCategories['deyoQa'].findIndex(d => d == card.labelList) >=0 ){
        this.deyoQa.push(card);
      }

      if( this.listCategories['pushToProduction'].findIndex(d => d == card.labelList) >=0 ){
        this.pushToProduction.push(card);
      }

      let event =  {
        board : this.getBoardName(card.idBoard),
        date : card.due,
        url : card.shortUrl,
        title : card.name,
        description : this.getBoardName(card.idBoard),
        rendering : '',
        classNames : card.dueComplete == true ? ['fc-complete', card.id] : [card.id]
      };

      this.calendar = this.calendar.concat(event);

      this.ready = true;
    });
  }

  clearData(){
    this.estimate = [];
    this.toDo = [];
    this.inProgress = [];
    this.techinfiniQa = [];
    this.deyoQa = [];
    this.pushToProduction = [];

    this.calendar = []
  }

}

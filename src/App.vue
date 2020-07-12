<template>
  <div id="app">
    <div class="button-wrapper">
      <el-button type="primary" icon="el-icon-message" @click="getRandomMessage">メッセージを拾う</el-button>
    </div>
    <div class="button-wrapper">
      <el-button type="primary" icon="el-icon-plus" @click="addFormVisible = true">メッセージを流す</el-button>
    </div>
    <div class="button-wrapper">
      <el-button icon="el-icon-user" @click="authFormVisible = true">流したメッセージ</el-button>
    </div>

    <el-dialog title="メッセージを流す" :visible.sync="addFormVisible" width="300px">
      <el-form :model="addForm">
        <span class="form-label">あなたのお名前</span>
        <el-input v-model="addForm.name"></el-input>
        <div class="form-group">
          <span class="form-label">合言葉</span><br>(本人確認に使います)<br><font color="#F56C6C">※安全ではないので普段使いでない文字列でお願いします</font>
          <el-input v-model="addForm.pass"></el-input>
        </div>
        <div class="form-group">
          <span class="form-label">メッセージ</span>
          <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 5}" v-model="addForm.message"></el-input>
        </div>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addFormVisible = false">キャンセル</el-button>
        <el-button type="primary" @click="onClickAdd" :disabled="addForm.message == '' || addForm.name == '' || addForm.pass == ''">決定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="拾ったメッセージ" :visible.sync="messageVisible" width="300px">
      <el-card class="box-card" shadow="never">{{ mail.message }}</el-card>
      <div class="form-group">
        <span><i class="el-icon-date"></i> {{ mail.date }}</span><br>
        <span><i class="el-icon-user"></i> {{ mail.name }}</span>
      </div>
      <div class="form-group">
        <el-button @click="messageVisible = false">閉じる</el-button>
      </div>
    </el-dialog>

    <el-dialog title="流したメッセージを見る" :visible.sync="authFormVisible" width="300px">
      <el-form :model="authForm">
        <span class="form-label">あなたのお名前</span>
        <el-input v-model="authForm.name"></el-input>
        <div class="form-group">
          <span class="form-label">合言葉</span>
          <el-input v-model="authForm.pass"></el-input>
        </div>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="authFormVisible = false">キャンセル</el-button>
        <el-button type="primary" @click="onClickAuth" :disabled="authForm.name == '' || authForm.pass == ''">決定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="流したメッセージ" :visible.sync="postedVisible" width="300px">
      <el-card class="box-card" v-for="post in postedMessages" :key="post.id" shadow="never">
        {{ post.message }}
        <div class="form-group">
          <span><i class="el-icon-date"></i> {{ post.date }}</span>
        </div>
        <div class="form-group">
          <el-tag type="success" v-show="post.opened">誰かに届きました</el-tag>
        </div>
        <div class="form-group">
          <el-button icon="el-icon-delete" @click="doDeleteMessage({name: authForm.name, pass: authForm.pass, id: post.id});">削除</el-button>
          <el-button type="primary" icon="el-icon-refresh" :disabled="!post.opened" @click="doResendMessage({name: authForm.name, pass: authForm.pass, id: post.id});">再送</el-button>
        </div>
      </el-card>
      <el-button @click="postedVisible = false">閉じる</el-button>
  </div>
</template>

<script>

export default {
  name: 'app',
  data: function() {
    return {
      addFormVisible: false,
      addForm: {
        name: '',
        pass: '',
        message: ''
      },
      messageVisible: false,
      mail: {
        name: '',
        message: '',
        date: ''
      },
      authFormVisible: false,
      authForm: {
        name: '',
        pass: '',
      },
      postedMessages: [],
      postedVisible: false
    };
  },
  methods: {
    onClickAdd: function() {
      this.addFormVisible = false;
      this.doAddMessage(this.addForm);
    },
    onClickAuth: function() {
      this.authFormVisible = false;
      this.doGetMessages(this.authForm);
    },
    doAddMessage: function(req) {
      this.axios.post('/api/do-add-message', req).then(response => {
        console.log('add:', response.data);
        if(response.data == "error"){
          this.$message({message: '失敗しました。', type: 'error'});
        }else{
          this.$message({message: '完了しました。', type: 'success'});
        }
        this.addForm.message = '';
      });
    },
    getRandomMessage: function() {
      this.axios.post('/api/get-random-message').then(response => {
        console.log('body:', response.data);
        if(response.data == "empty" || response.data == "error"){
          this.$message({message: '拾えませんでした。', type: 'error'});
        }else{
          this.mail.name = response.data.name;
          this.mail.message = response.data.message;
          var dt = new Date(response.data.date);
          this.mail.date = dt.toLocaleString();
          this.messageVisible = true;
        }
      });
    },
    doGetMessages: function(req){
      this.axios.post('/api/get-messages-by-name', req).then(response => {
        console.log('body:', response.data);
        if(response.data == "empty" || response.data == "error"){
          this.$message({message: '見つかりませんでした。', type: 'error'});
        }else{
          this.postedMessages.splice(0);
          response.data.forEach(post => { 
              this.postedMessages.push({
                id: post.id,
                message: post.message,
                date: (new Date(post.date)).toLocaleString(),
                opened: post.opened
            });
          });
          this.postedVisible = true;
          console.log(this.postedMessages);
        }
      });
    },
    doResendMessage: function(req){
      this.axios.post('/api/resend-message', req).then(response => {
        console.log('body:', response.data);
        this.doGetMessages(this.authForm);
      });
    },
    doDeleteMessage: function(req){
      this.axios.post('/api/delete-message', req).then(response => {
        console.log('body:', response.data);
        this.doGetMessages(this.authForm);
      });
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.button-wrapper{
  margin-bottom: 20px;
}

.form-group {
  margin-top: 15px;  
}

.box-card{
  white-space:pre-wrap;
  word-wrap:break-word;
  margin-bottom: 15px;
}
</style>

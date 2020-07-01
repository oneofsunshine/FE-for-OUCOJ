<template>
  <div class="view">
    <Panel :title="this.routeName === 'course-user-toadd-list' ? 'Course toadd User' : 'Course added User'">
      <div slot="header">
        <el-input
          v-model="keyword"
          prefix-icon="el-icon-search"
          placeholder="Keywords">
        </el-input>
      </div>
      <el-table
        v-loading="loading"
        element-loading-text="loading"
        ref="table"
        :data="userList"
        style="width: 100%"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>

        <el-table-column prop="id" label="ID" width="60"></el-table-column>

        <el-table-column prop="username" label="Username"></el-table-column>

        <el-table-column prop="sno" label="Student No"></el-table-column>

        <el-table-column prop="real_name" label="Real Name"></el-table-column>

        <el-table-column prop="is_disabled" label="Disabled">
          <template slot-scope="scope">
            {{ scope.row.is_disabled }}
          </template>
        </el-table-column>

        <el-table-column prop="admin_type" label="User Type">
          <template slot-scope="scope">
            {{ scope.row.admin_type }}
          </template>
        </el-table-column>

        <el-table-column fixed="right" label="Option" width="200">
          <template slot-scope="{row}">
            <icon-btn name="Edit" icon="edit" @click.native="openUserDialog(row.id)"></icon-btn>
            <icon-btn name="Delete" icon="trash" @click.native="deleteUsers([row.id])"></icon-btn>
          </template>
        </el-table-column>
      </el-table>

      <div class="panel-options">
        <el-button v-if="routeName == 'course-user-toadd-list'" type="primary" size="small" v-show="selectedUsers.length"
                   @click="addOrRemoveUsers" icon="el-icon-fa-plus-circle">Add
        </el-button>
        <el-button v-else type="warning" size="small" v-show="selectedUsers.length"
                   @click="addOrRemoveUsers" icon="el-icon-fa-minus-circle">Remove
        </el-button>
        <el-pagination
          class="page"
          layout="prev, pager, next"
          @current-change="currentChange"
          :page-size="pageSize"
          :total="total">
        </el-pagination>
      </div>
    </Panel>
    <el-dialog :title="$t('m.User_Info')" :visible.sync="showUserDialog" :close-on-click-modal="false">
      <el-form :model="user" label-width="120px" label-position="left">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('m.User_Username')" required>
              <el-input v-model="user.username"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('m.User_Real_Name')" required>
              <el-input v-model="user.real_name"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('m.User_Type')">
              <el-select v-model="user.admin_type">
                <el-option label="Regular User" value="Regular User"></el-option>
                <el-option label="Admin" value="Admin"></el-option>
                <el-option label="Super Admin" value="Super Admin"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="18">
            <el-form-item :label="$t('m.Student_No')">
              <el-input v-model="user.sno"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('m.Is_Disabled')">
              <el-switch
                v-model="user.is_disabled">
              </el-switch>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <cancel @click.native="showUserDialog = false">Cancel</cancel>
        <save @click.native="saveUser()"></save>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import api from '../../api.js'

  export default {
    name: 'CourseUserList',
    data () {
      return {
        pageSize: 10,
        total: 0,
        userList: [],
        loading: false,
        currentPage: 1,
        routeName: '',
        courseId: '',
        selectedUsers: [],
        keyword: '',
        showUserDialog: false,
        user: {}
      }
    },
    mounted () {
      this.routeName = this.$route.name
      this.courseId = this.$route.params.courseId
      this.getCourseUserList(this.currentPage)
    },
    methods: {
      // 切换页码回调
      handleSelectionChange (val) {
        this.selectedUsers = val
      },
      deleteUsers (ids) {
        this.$confirm('Sure to delete the user? The associated resources created by this user will be deleted as well, like problem, contest, announcement, etc.', 'confirm', {
          type: 'warning'
        }).then(() => {
          api.deleteUsers(ids.join(',')).then(res => {
            this.getCourseUserList(this.currentPage)
          }).catch(() => {
            this.getCourseUserList(this.currentPage)
          })
        }, () => {
        })
      },
      currentChange (page) {
        this.currentPage = page
        this.getCourseUserList(page)
      },
      saveUser () {
        api.editUser(this.user).then(res => {
          // 更新列表
          this.getCourseUserList(this.currentPage)
        }).then(() => {
          this.showUserDialog = false
        }).catch(() => {
        })
      },
      // 打开用户对话框
      openUserDialog (id) {
        this.showUserDialog = true
        api.getUser(id).then(res => {
          this.user = res.data.data
          this.user.password = ''
          this.user.real_tfa = this.user.two_factor_auth
        })
      },
      getCourseUserList (page) {
        this.loading = true
        let params = {
          limit: this.pageSize,
          offset: (page - 1) * this.pageSize,
          course_id: this.courseId,
          keyword: this.keyword,
          is_add: this.routeName === 'course-user-toadd-list' ? '1' : '0'
        }
        api.getCourseUserList(params).then(res => {
          this.loading = false
          this.total = res.data.data.total
          this.userList = res.data.data.results
        }, res => {
          this.loading = false
        })
      },
      addOrRemoveUsers () {
        let userIds = []
        for (let c of this.selectedUsers) {
          userIds.push(c.id)
        }
        let data = {
          course_id: this.courseId,
          user_ids: userIds,
          is_add: this.routeName === 'course-user-toadd-list' ? '1' : '0'
        }
        api.addOrRemoveCourseUser(data).then(res => {
          this.getCourseUserList(this.currentPage)
        }).catch()
      }
    },
    watch: {
      'keyword' () {
        this.currentChange(1)
      },
      '$route' (newVal, oldVal) {
        this.courseId = newVal.params.courseId
        this.routeName = newVal.name
        this.getCourseUserList(this.currentPage)
      }
    }
  }
</script>

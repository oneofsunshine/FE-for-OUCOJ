<template>
  <div class="view">
    <h3>
      Switch processed: <el-switch v-model="handleRequest" @change="handleRequestSwitch(handleRequest)"></el-switch>
    </h3>
    <Panel :title="!handleRequest ? 'Unprocessed Requests' : 'Processed Requests'">
      <div slot="header">
        <el-input
          v-model="keyword"
          prefix-icon="el-icon-search"
          placeholder="Keywords">
        </el-input>
      </div>
      <el-table
        v-loading="loading"
        v-if="!handleRequest"
        element-loading-text="loading"
        ref="table"
        :data="userRequestList"
        style="width: 100%"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>

        <el-table-column prop="id" label="#" width="60"></el-table-column>

        <el-table-column prop="request_username" label="Username"></el-table-column>

        <el-table-column prop="request_sno" label="Student No"></el-table-column>

        <el-table-column prop="request_real_name" label="Real Name"></el-table-column>
      </el-table>

      <el-table
        v-loading="loading"
        v-else
        element-loading-text="loading"
        ref="table"
        :data="userRequestList"
        style="width: 100%">
        <el-table-column type="selection" width="55"></el-table-column>

        <el-table-column prop="id" label="#" width="80"></el-table-column>

        <el-table-column prop="request_username" label="Username"></el-table-column>

        <el-table-column prop="request_sno" label="Student No"></el-table-column>

        <el-table-column prop="request_real_name" label="Real Name"></el-table-column>

        <el-table-column prop="accepted" label="Accepted">
          <template slot-scope="scope">
            {{ scope.row.accepted }}
          </template>
        </el-table-column>
      </el-table>

      <div class="panel-options">
        <el-button v-if="!handleRequest" type="primary" size="small" v-show="selectedUserRequests.length"
                   @click="agreeUserRequests" icon="el-icon-fa-plus-circle">Agree
        </el-button>
        <el-button v-if="!handleRequest" type="warning" size="small" v-show="selectedUserRequests.length"
                   @click="refuseUserRequests" icon="el-icon-fa-minus-circle">Refuse
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
  </div>
</template>

<script>
  import api from '../../api.js'

  export default {
    name: 'CourseUserRequestList',
    data () {
      return {
        pageSize: 10,
        total: 0,
        userRequestList: [],
        loading: false,
        currentPage: 1,
        courseId: '',
        selectedUserRequests: [],
        keyword: '',
        handleRequest: false
      }
    },
    mounted () {
      this.courseId = this.$route.params.courseId
      this.getCourseUserRequestList(this.currentPage)
    },
    methods: {
      // 切换页码回调
      handleSelectionChange (val) {
        this.selectedUserRequests = val
      },
      currentChange (page) {
        this.currentPage = page
        this.getCourseUserRequestList(page)
      },
      getCourseUserRequestList (page) {
        this.loading = true
        let params = {
          limit: this.pageSize,
          offset: (page - 1) * this.pageSize,
          course_id: this.courseId,
          keyword: this.keyword,
          handle_request: this.handleRequest ? '1' : '0'
        }
        api.getCourseUserRequestList(params).then(res => {
          this.loading = false
          this.total = res.data.data.total
          this.userRequestList = res.data.data.results
        }, res => {
          this.loading = false
        })
      },
      agreeUserRequests () {
        let userRequestIds = []
        for (let c of this.selectedUserRequests) {
          userRequestIds.push(c.id)
        }
        let data = {
          course_id: this.courseId,
          user_request_ids: userRequestIds,
          is_agree: '1'
        }
        api.agreeOrRefuseUserRequests(data).then(res => {
          this.getCourseUserRequestList(this.currentPage)
        }).catch()
      },
      refuseUserRequests () {
        let userRequestIds = []
        for (let c of this.selectedUserRequests) {
          userRequestIds.push(c.id)
        }
        let data = {
          course_id: this.courseId,
          user_request_ids: userRequestIds,
          is_agree: '0'
        }
        api.agreeOrRefuseUserRequests(data).then(res => {
          this.getCourseUserRequestList(this.currentPage)
        }).catch()
      },
      handleRequestSwitch () {
        this.currentPage = 1
        this.getCourseUserRequestList(this.currentPage)
      }
    },
    watch: {
      'keyword' () {
        this.currentChange(1)
      },
      '$route' (newVal, oldVal) {
        this.courseId = newVal.params.courseId
        this.getCourseUserRequestList(this.currentPage)
      }
    }
  }
</script>

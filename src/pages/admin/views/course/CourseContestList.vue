<template>
  <div class="view">
    <Panel :title="this.routeName === 'course-contest-toadd-list' ? 'Course toadd Contest' : 'Course added Contest'">
      <el-table
        v-loading="loading"
        element-loading-text="loading"
        ref="table"
        :data="contestList"
        style="width: 100%"
        @selection-change="handleSelectionChange">
        <el-table-column type="expand">
          <template slot-scope="props">
            <p>Start Time: {{props.row.start_time | localtime }}</p>
            <p>End Time: {{props.row.end_time | localtime }}</p>
            <p>Create Time: {{props.row.create_time | localtime}}</p>
            <p>Creator: {{props.row.created_by.username}}</p>
          </template>
        </el-table-column>
        <el-table-column
          type="selection"
          width="60">
        </el-table-column>
        <el-table-column
          prop="id"
          width="80"
          label="ID">
        </el-table-column>
        <el-table-column
          prop="title"
          label="Title">
        </el-table-column>
        <el-table-column
          label="Rule Type"
          width="130">
          <template slot-scope="scope">
            <el-tag type="gray">{{scope.row.rule_type}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="Contest Type"
          width="180">
          <template slot-scope="scope">
            <el-tag :type="scope.row.contest_type === 'Public' ? 'success' : 'primary'">
              {{ scope.row.contest_type}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="Status"
          width="130">
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.status === '-1' ? 'danger' : scope.row.status === '0' ? 'success' : 'primary'">
              {{ scope.row.status | contestStatus}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          width="100"
          label="Visible">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.visible"
                       active-text=""
                       inactive-text=""
                       @change="handleVisibleSwitch(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          width="250"
          label="Operation">
          <div slot-scope="scope">
            <icon-btn name="Edit" icon="edit" @click.native="goEdit(scope.row.id)"></icon-btn>
            <icon-btn name="Problem" icon="list-ol" @click.native="goContestProblemList(scope.row.id)"></icon-btn>
            <icon-btn name="Announcement" icon="info-circle"
                      @click.native="goContestAnnouncement(scope.row.id)"></icon-btn>
            <icon-btn icon="download" name="Download Accepted Submissions"
                      @click.native="openDownloadOptions(scope.row.id)"></icon-btn>
          </div>
        </el-table-column>
      </el-table>
      <div class="panel-options">
        <el-button v-if="routeName == 'course-contest-toadd-list'" type="primary" size="small" v-show="selected_contests.length"
                   @click="addOrRemoveContests" icon="el-icon-fa-plus-circle">Add
        </el-button>
        <el-button v-else type="primary" size="small" v-show="selected_contests.length"
                   @click="addOrRemoveContests" icon="el-icon-fa-minus-circle">Remove
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
    <el-dialog title="Download Contest Submissions"
               width="30%"
               :visible.sync="downloadDialogVisible">
      <el-switch v-model="excludeAdmin" active-text="Exclude admin submissions"></el-switch>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="downloadSubmissions">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import api from '../../api.js'
  import utils from '@/utils/utils'
  import {CONTEST_STATUS_REVERSE} from '@/utils/constants'

  export default {
    name: 'CourseContestList',
    data () {
      return {
        pageSize: 10,
        total: 0,
        contestList: [],
        loading: false,
        excludeAdmin: true,
        currentPage: 1,
        routeName: '',
        courseId: '',
        downloadDialogVisible: false,
        selected_contests: []
      }
    },
    mounted () {
      this.routeName = this.$route.name
      this.courseId = this.$route.params.courseId
      this.getCourseContestList(this.currentPage)
    },
    filters: {
      contestStatus (value) {
        return CONTEST_STATUS_REVERSE[value].name
      }
    },
    methods: {
      // 切换页码回调
      handleSelectionChange (val) {
        this.selected_contests = val
      },
      currentChange (page) {
        this.currentPage = page
        this.getCourseContestList(page)
      },
      getCourseContestList (page) {
        this.loading = true
        let params = {
          limit: this.pageSize,
          offset: (page - 1) * this.pageSize,
          course_id: this.courseId,
          is_add: this.routeName === 'course-contest-toadd-list' ? '1' : '0'
        }
        api.getCourseContestList(params).then(res => {
          this.loading = false
          this.total = res.data.data.total
          this.contestList = res.data.data.results
        }, res => {
          this.loading = false
        })
      },
      openDownloadOptions (contestId) {
        this.downloadDialogVisible = true
        this.contestId = contestId
      },
      downloadSubmissions () {
        let excludeAdmin = this.excludeAdmin ? '1' : '0'
        let url = `/admin/download_submissions?contest_id=${this.contestId}&exclude_admin=${excludeAdmin}`
        utils.downloadFile(url)
      },
      goEdit (contestId) {
        this.$router.push({name: 'edit-contest', params: {contestId}})
      },
      goContestAnnouncement (contestId) {
        this.$router.push({name: 'contest-announcement', params: {contestId}})
      },
      goContestProblemList (contestId) {
        this.$router.push({name: 'contest-problem-list', params: {contestId}})
      },
      handleVisibleSwitch (row) {
        api.editContest(row)
      },
      addOrRemoveContests () {
        let contestIds = []
        for (let c of this.selected_contests) {
          contestIds.push(c.id)
        }
        let data = {
          course_id: this.courseId,
          contest_ids: contestIds,
          is_add: this.routeName === 'course-contest-toadd-list' ? '1' : '0'
        }
        api.addOrRemoveCourseContest(data).then(res => {
          this.getCourseContestList(this.currentPage)
        }).catch()
      }
    },
    watch: {
      '$route' (newVal, oldVal) {
        this.courseId = newVal.params.courseId
        this.routeName = newVal.name
        this.getCourseContestList(this.currentPage)
      }
    }
  }
</script>

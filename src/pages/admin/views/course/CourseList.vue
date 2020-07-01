<template>
  <div class="view">
    <Panel :title="this.$i18n.t('m.Course_List')">
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
        :data="courseList"
        style="width: 100%">
        <el-table-column
          prop="id"
          width="50"
          label="#">
        </el-table-column>
        <el-table-column
          prop="name"
          width="150"
          label="Name">
        </el-table-column>
        <el-table-column
          prop="s_year"
          width="150"
          label="Academic Year">
        </el-table-column>
        <el-table-column
          prop="short_description"
          label="Short Description">
        </el-table-column>
        <el-table-column
          width="150"
          label="Contest Manage">
          <div slot-scope="scope">
            <icon-btn icon="list-ul" name="Course Contest List" @click.native="goCourseContestList(scope.row.id)"></icon-btn>
            <icon-btn icon="plus-square" name="Course Contest ToAdd List" @click.native="goCourseContestToAddList(scope.row.id)"></icon-btn>
          </div>
        </el-table-column>
        <el-table-column
          width="180"
          label="User Manage">
          <div slot-scope="scope">
            <icon-btn icon="check-square-o" name="User Join Request List" @click.native="goCourseUserRequestList(scope.row.id)"></icon-btn>
            <icon-btn icon="list-ul" name="Course User List" @click.native="goCourseUserList(scope.row.id)"></icon-btn>
            <icon-btn icon="plus-square" name="Course User ToAdd List" @click.native="goCourseUserToAddList(scope.row.id)"></icon-btn>
          </div>
        </el-table-column>
        <el-table-column
          fixed="right"
          width="180"
          label="Operation">
          <div slot-scope="scope">
            <icon-btn icon="edit" name="Edit Course" @click.native="openCourseDialog(scope.row.id)"></icon-btn>
            <icon-btn icon="download" name="Download Course Grade Count"
                      @click.native="openDownloadOptions(scope.row.id)"></icon-btn>
            <icon-btn icon="trash" name="Delete Course" @click.native="deleteCourse(scope.row.id)"></icon-btn>
          </div>
        </el-table-column>
      </el-table>
      <div class="panel-options">
        <el-button type="primary" size="small" @click="openCourseDialog(null)" icon="el-icon-plus">Create</el-button>
        <el-pagination
          class="page"
          layout="prev, pager, next"
          @current-change="currentChange"
          :page-size="pageSize"
          :total="total">
        </el-pagination>
      </div>
    </Panel>
    <el-dialog title="Download Course Grade"
               width="30%"
               :visible.sync="downloadDialogVisible">
      <span><h3>Download Student Grade for All Or Special</h3></span>
      <el-input v-model="sNo" placeholder="Special student number:(blank for all)"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="downloadCourseGrade">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog :title="courseDialogTitle" :visible.sync="showEditCourseDialog"
               @open="onOpenEditDialog" :close-on-click-modal="false">
      <el-form label-position="top">
        <el-form-item :label="$t('m.Course_Name')" required>
          <el-input
            v-model="course.name"
            :placeholder="$t('m.Course_Name')" class="title-input">
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('m.Course_Academic_Year')">
          <el-input
            v-model="course.s_year"
            :placeholder="$t('m.Course_Academic_Year')">
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('m.Course_Short_Description')">
          <el-input
            v-model="course.short_description"
            :placeholder="$t('m.Course_Short_Description')">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
          <cancel @click.native="showEditCourseDialog = false"></cancel>
          <save type="primary" @click.native="submitCourse"></save>
        </span>
    </el-dialog>
  </div>
</template>

<script>
  import api from '../../api.js'
  import utils from '@/utils/utils'

  export default {
    name: 'CourseList',
    data () {
      return {
        pageSize: 10,
        total: 0,
        courseList: [],
        keyword: '',
        loading: false,
        sNo: '',
        currentPage: 1,
        downloadDialogVisible: false,
        showEditCourseDialog: false,
        currentCourseId: null,
        mode: 'create',
        course: {
          name: '',
          s_year: '',
          short_description: ''
        },
        courseDialogTitle: 'Edit Course'
      }
    },
    mounted () {
      this.getCourseList(this.currentPage)
    },
    methods: {
      // 切换页码回调
      currentChange (page) {
        this.currentPage = page
        this.getCourseList(page)
      },
      getCourseList (page) {
        this.loading = true
        api.getCourseList((page - 1) * this.pageSize, this.pageSize, this.keyword).then(res => {
          this.loading = false
          this.total = res.data.data.total
          this.courseList = res.data.data.results
        }, res => {
          this.loading = false
        })
      },
      onOpenEditDialog () {
        // todo 优化
        // 暂时解决 文本编辑器显示异常bug
        setTimeout(() => {
          if (document.createEvent) {
            let event = document.createEvent('HTMLEvents')
            event.initEvent('resize', true, true)
            window.dispatchEvent(event)
          } else if (document.createEventObject) {
            window.fireEvent('onresize')
          }
        }, 0)
      },
      deleteCourse (id) {
        this.$confirm('Sure to delete this course? The course student_list and contest_list will be deleted as well.', 'Delete Course', {
          type: 'warning'
        }).then(() => {
          api.deleteCourse(id).then(() => [
            this.getCourseList(this.currentPage)
          ]).catch(() => {
          })
        }, () => {
        })
      },
      submitCourse (data = undefined) {
        let funcName = ''
        if (!data.name) {
          data = {
            id: this.currentCourseId,
            name: this.course.name,
            s_year: this.course.s_year,
            short_description: this.course.short_description
          }
        }
        funcName = this.mode === 'edit' ? 'updateCourse' : 'createCourse'
        api[funcName](data).then(res => {
          this.showEditCourseDialog = false
          this.getCourseList(this.currentPage)
        }).catch()
      },
      openCourseDialog (id) {
        this.showEditCourseDialog = true
        if (id !== null) {
          this.currentCourseId = id
          this.courseDialogTitle = 'Edit Course'
          this.courseList.find(item => {
            if (item.id === this.currentCourseId) {
              this.course.name = item.name
              this.course.s_year = item.s_year
              this.course.short_description = item.short_description
              this.mode = 'edit'
            }
          })
        } else {
          this.courseDialogTitle = 'Create Course'
          this.course.name = ''
          this.course.s_year = ''
          this.course.short_description = ''
          this.mode = 'create'
        }
      },
      openDownloadOptions (currentCourseId) {
        this.downloadDialogVisible = true
        this.currentCourseId = currentCourseId
      },
      downloadCourseGrade () {
        let url = `/admin/course/grade?course_id=${this.currentCourseId}&sno=${this.sNo}`
        utils.downloadFile(url)
        this.downloadDialogVisible = false
      },
      goCourseContestList (courseId) {
        this.$router.push({name: 'course-contest-list', params: {courseId}})
      },
      goCourseContestToAddList (courseId) {
        this.$router.push({name: 'course-contest-toadd-list', params: {courseId}})
      },
      goCourseUserRequestList (courseId) {
        this.$router.push({name: 'course-user-request-list', params: {courseId}})
      },
      goCourseUserList (courseId) {
        this.$router.push({name: 'course-user-list', params: {courseId}})
      },
      goCourseUserToAddList (courseId) {
        this.$router.push({name: 'course-user-toadd-list', params: {courseId}})
      }
    },
    watch: {
      'keyword' () {
        this.currentChange(1)
      }
    }
  }
</script>

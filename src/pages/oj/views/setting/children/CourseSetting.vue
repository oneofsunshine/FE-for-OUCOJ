<template>
  <div class="setting-main">
    <div class="container" style="margin-bottom: 10%">
      <Panel shadow>
        <div slot="title">{{$t('m.Course_Selected')}}</div>
        <Table style="width: 100%; font-size: 16px;"
                 :columns="selectedCourseTableColumns"
                 :data="selectedCourseList"
                 :loading="selectInfo.loaing"
                 disabled-hover></Table>
      </Panel>
      <Pagination :total="selectInfo.total" :page-size="selectInfo.pageSize" @on-change="getSelectedCourseList" :current.sync="selectInfo.page"></Pagination>
    </div>

    <div>
      <Panel shadow>
        <div slot="title">{{$t('m.Course_Unselected')}}</div>
        <Table style="width: 100%; font-size: 16px;"
                 :columns="unselectedCourseTableColumns"
                 :data="unselectedCourseList"
                 :loading="unselectInfo.loaing"
                 disabled-hover></Table>
      </Panel>
      <Pagination :total="unselectInfo.total" :page-size="unselectInfo.pageSize" @on-change="getUnselectedCourseList" :current.sync="unselectInfo.page"></Pagination>
    </div>
  </div>
</template>

<script>
  import api from '@oj/api'
  import Pagination from '@oj/components/Pagination'

  export default {
    components: {
      Pagination
    },
    data () {
      return {
        selectInfo: {
          pageSize: 3,
          total: 0,
          loading: false,
          page: 1
        },
        unselectInfo: {
          pageSize: 10,
          total: 0,
          loading: false,
          page: 1
        },
        selectedCourseList: [],
        unselectedCourseList: [],
        selectedCourseTableColumns: [
          {
            title: '#',
            key: 'id',
            width: 50
          },
          {
            title: this.$i18n.t('m.Course_Name'),
            key: 'name',
            width: 150
          },
          {
            title: this.$i18n.t('m.Course_Academic_Year'),
            key: 's_year',
            width: 150
          },
          {
            title: this.$i18n.t('m.Course_Short_Description'),
            key: 'short_description'
          },
          {
            title: 'Action',
            key: 'action',
            width: 150,
            align: 'center',
            render: (h, params) => {
              return h('Button', {
                props: {
                  type: 'text',
                  size: 'large'
                },
                on: {
                  click: () => {
                    this.deleteCourse(params.row.id)
                  }
                },
                style: {
                  padding: '2px 0'
                }
              }, 'Delete')
            }
          }
        ],
        unselectedCourseTableColumns: [
          {
            title: '#',
            key: 'id',
            width: 50
          },
          {
            title: this.$i18n.t('m.Course_Name'),
            key: 'name',
            width: 150
          },
          {
            title: this.$i18n.t('m.Course_Academic_Year'),
            key: 's_year',
            width: 150
          },
          {
            title: this.$i18n.t('m.Course_Short_Description'),
            key: 'short_description'
          },
          {
            title: 'Action',
            width: 150,
            align: 'center',
            render: (h, params) => {
              return h('Button', {
                props: {
                  type: 'text',
                  size: 'large'
                },
                attrs: {
                  disabled: params.row.is_exist,
                  title: this.getTitleStatus(params.row.is_exist, params.row.status)
                },
                on: {
                  click: () => {
                    if (!params.row.is_exist) {
                      this.addCourse(params.row.id)
                    }
                  }
                },
                style: {
                  padding: '2px 0'
                }
              }, this.getStatus(params.row.is_exist, params.row.status))
            }
          }
        ],
        keyword: ''
      }
    },
    mounted () {
      this.getSelectedCourseList(1)
      this.getUnselectedCourseList(1)
    },
    methods: {
      getTitleStatus (isExist, status) {
        let passage = 'Apply to join the course.'
        if (isExist) {
          passage = 'Waiting for administrator review.'
          if (status) {
            passage = 'Administrator rejected your application. Contact administrator to join'
          }
        }
        return passage
      },
      getStatus (isExist, status) {
        let passage = 'Add'
        if (isExist) {
          passage = 'Requested'
          if (status) {
            passage = 'Refused'
          }
        }
        return passage
      },
      currentChange (spage, upage) {
        this.selectInfo.page = spage
        this.getSelectedCourseList(spage)
        this.unselectInfo.page = upage
        this.getUnselectedCourseList(upage)
      },
      getSelectedCourseList (page) {
        this.selectInfo.loading = true
        let isSelected = '1'
        api.getCourseList((page - 1) * this.selectInfo.pageSize, this.selectInfo.pageSize, isSelected).then(res => {
          this.selectInfo.loading = false
          this.selectInfo.total = res.data.data.total
          this.selectedCourseList = res.data.data.results
        }, res => {
          this.selectInfo.loading = false
        })
      },
      getUnselectedCourseList (page) {
        this.unselectInfo.loading = true
        let isSelected = '0'
        api.getCourseList((page - 1) * this.unselectInfo.pageSize, this.unselectInfo.pageSize, isSelected).then(res => {
          this.unselectInfo.loading = false
          this.unselectInfototal = res.data.data.total
          this.unselectedCourseList = res.data.data.results
        }, res => {
          this.unselectInfo.loading = false
        })
      },
      deleteCourse (courseId) {
        let data = {
          course_id: courseId,
          is_selected: '1'
        }
        api.addOrRemoveUserContest(data).then(() => [
          this.getSelectedCourseList(this.selectInfo.page),
          this.getUnselectedCourseList(this.unselectInfo.page)
        ]).catch(() => {
        })
      },
      addCourse (courseId) {
        let data = {
          course_id: courseId,
          is_selected: '0'
        }
        api.addOrRemoveUserContest(data).then(() => [
          this.getSelectedCourseList(this.selectInfo.page),
          this.getUnselectedCourseList(this.unselectInfo.page)
        ]).catch(() => {
        })
      }
    },
    watch: {
      'keyword' () {
        this.currentChange(1, 1)
      }
    }
  }
</script>
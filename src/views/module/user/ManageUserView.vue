<template>

    <div>

        <el-row>
            <el-col :span="18">
                <div>
                    <el-form :inline="true" :model="searchParameter" class="demo-form-inline">
                        <el-form-item label="关键字">
                            <el-input style="min-width: 250px"
                                      v-model="searchParameter.keyword" placeholder="模糊搜索(账号名,手机号,邮箱...)"
                                      clearable @change="queryByCondition"></el-input>
                        </el-form-item>
                        <el-form-item label="注册时间">
                            <el-date-picker
                                    v-model="dateSelectorArray"
                                    type="daterange"
                                    range-separator="至"
                                    start-placeholder="开始日期"
                                    end-placeholder="结束日期">
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" icon="el-icon-search" @click="queryByCondition">查询
                            </el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </el-col>
            <el-col :span="6">
                <el-button type="primary" icon="el-icon-refresh" size="small" round @click="obtainTableData">刷新
                </el-button>
                <el-button type="primary" icon="el-icon-plus" size="small" round @click="addRow">新增</el-button>
            </el-col>
        </el-row>

        <el-table
                :data="tableData"
                v-loading="isLoading"
                style="width: 100%"
                max-height="350">
            <el-table-column
                    fixed
                    prop="uid"
                    label="ID"
                    width="50">
            </el-table-column>
            <el-table-column
                    prop="account"
                    label="帐号名"
                    width="120">
            </el-table-column>
            <el-table-column
                    prop="phoneNumber"
                    label="手机号"
                    width="120">
            </el-table-column>
            <el-table-column
                    prop="emailAddress"
                    label="邮箱地址"
                    width="150">
            </el-table-column>
            <el-table-column
                    prop="registrationTime"
                    label="注册时间"
                    width="200">
            </el-table-column>

            <el-table-column
                    prop="registrationIp"
                    label="注册IP"
                    width="150">
            </el-table-column>

            <el-table-column
                    prop="channelName"
                    label="注册渠道"
                    width="150">
            </el-table-column>

            <el-table-column
                    label="是否可用"
                    width="120">
                <template slot-scope="scope">
                    <!--<el-popover trigger="hover" placement="top">
                        <p>姓名: {{ scope.row.name }}</p>
                        <p>住址: {{ scope.row.address }}</p>
                        <div slot="reference" class="name-wrapper">
                            <el-tag size="medium">{{ scope.row.name }}</el-tag>
                        </div>
                    </el-popover>-->
                    <el-switch v-model="tableData[scope.$index].enabled"
                               @change="handleSwitchChanged(scope.$index,tableData)"/>
                </template>
            </el-table-column>

            <el-table-column
                    fixed="right"
                    label="操作"
                    width="120">
                <template slot-scope="scope">
                    <el-button
                            @click.native.prevent="deleteRow(scope.$index, tableData)"
                            type="text"
                            size="small">
                        删除
                    </el-button>

                    <el-button
                            @click.native.prevent="updateRow(scope.$index, tableData)"
                            type="text"
                            size="small">
                        修改
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <div class="block">
            <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="currentPageIndex"
                    :page-sizes="[100, 200, 300, 400]"
                    :page-size="currentPageSize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="currentTotal">
            </el-pagination>
        </div>

        <el-divider/>

        <!--对话框控件-->
        <my-au-dialog :data-source="selectedEntity" :visible.sync="dialogVisible" :title="dialogTitle"
                      v-on:done="onDialogDone"/>
    </div>

</template>

<script>
    import apiHandler from "@/api/base/ApiHandler";
    import AUdialog from "@/components/dialog/AddOrUpdateRandlUserDialog.vue";
    import jsValidate from '@/util/JsValidate';
    import dateTimeUtil from '@/util/DateTimeUtil.js';

    export default {
        name: "ManageRegisteredUserView",
        components: {
            "my-au-dialog": AUdialog,
        },
        mounted: function () {
            this.obtainTableData();
        },
        /**
         *
         * @returns {{isLoading: boolean, currentPageSize: number, dialogVisible: boolean, registerDateArray: [], dialogVisible2: boolean, dialogTitle: string, tableData: [], searchParameter: {registerDateArray: [], registerDateRange: null, keyword: null}, currentPageIndex: number, selectedEntity: null}}
         */
        data() {
            return {

                /**
                 *表格是否在加载中
                 */
                isLoading: false,

                dialogVisible: false,
                dialogVisible2: false,

                dialogTitle: "",
                /**
                 *表格当前页指针
                 */
                currentPageIndex: 1,
                /**
                 *表格当前页能显示的大小
                 */
                currentPageSize: 100,

                /**
                 *
                 */
                dateSelectorArray: [],
                /**
                 *表格数据
                 */
                tableData: []
                ,
                searchParameter: {
                    keyword: null,
                    startDate: null,
                    endDate: null
                },
                selectedEntity: null,
            }
        }
        ,
        computed: {
            /**
             *所有数量数
             */
            currentTotal: function () {
                return this.tableData.length;
            },
            systemUser: function () {
                return this.$store.state.systemUser;
            }
        }
        ,
        methods: {
            obtainTableData() {
                this.isLoading = true;
                let Vue = this;
                apiHandler.getRandlUserApi().getByPage({
                    index: this.currentPageIndex,
                    size: this.currentPageSize
                }, function (data) {
                    Vue.processTableData(data);
                });
            },
            queryByCondition() {
                let Vue = this;

                //参数为空设置
                this.searchParameter.index = this.currentPageIndex;
                this.searchParameter.size = this.currentPageSize;
                if (jsValidate.isEmpty(this.searchParameter.keyword)) {
                    this.searchParameter.keyword = null;
                }
                //参数格式化时间
                if (this.dateSelectorArray != null && this.dateSelectorArray.length > 0) {
                    let startDate = this.dateSelectorArray[0];
                    let endDate = this.dateSelectorArray[1];
                    startDate = dateTimeUtil.formatDate("YYYY-mm-dd", startDate);
                    endDate = dateTimeUtil.formatDate("YYYY-mm-dd", endDate);
                    this.searchParameter.startDate = startDate
                    this.searchParameter.endDate = endDate;
                }
                else if (this.dateSelectorArray == null) {
                    this.searchParameter.startDate = null
                    this.searchParameter.endDate = null;
                }

                apiHandler.getUserApi().condition(this.searchParameter)
                    .then(function (data) {
                        Vue.processTableData(data);
                    });
            },
            processTableData(data) {
                let Vue = this;
                if (data.isSuccessful) {
                    let pageData = data.responseBody;
                    Vue._data.isLoading = false;
                    //是视图化数据
                    for (let item of pageData.list) {
                        //是否是可用的
                        item.enabled = item.accountStatus != 0;

                        //账号渠道
                        if (item.channel == 0) {
                            item.channelName = "0:管理员添加";
                        }
                        else if (item.channel == 1) {
                            item.channelName = "1:用户注册";
                        }
                        else if (item.channel == 2) {
                            item.channelName = "2:数据库添加";
                        }
                        else {
                            item.channelName = "其他";
                        }
                    }
                    Vue._data.tableData = pageData.list;

                }
                else {
                    Vue.$messageUtil.error(data.responseBody);
                }
                Vue.isLoading = false;
            },
            handleSizeChange(val) {
                this.currentPageSize = val;
            },
            handleCurrentChange(val) {
                this.currentPageIndex = val;
                this.obtainTableData();
            },
            handleSwitchChanged(index, tableData) {
                let Vue = this;
                this.isLoading = true;

                var entity = tableData[index];
                if (entity.enabled) {
                    entity.accountStatus = 1;
                }
                else {
                    entity.accountStatus = 0;
                }

                apiHandler.getRandlUserApi().update1(entity).then((data) => {
                    if (data.isSuccessful) {
                        Vue.$messageUtil.success(data.responseBody);
                    }
                    else {
                        //恢复原来的开关状态
                        Vue._data.tableData[index].enabled = !(Vue._data.tableData[index].enabled);
                        if (Vue._data.tableData[index].enabled) {
                            Vue._data.tableData[index].accountStatus = 1;
                        }
                        else {
                            Vue._data.tableData[index].accountStatus = 0;
                        }
                        Vue.$messageUtil.error(data.responseBody);
                    }
                    this.isLoading = false;
                });
            },
            deleteRow(index, rows) {
                let uid = rows[index].uid;
                let Vue = this;
                this.$messageUtil.sureDialog("是否要删除该名注册用户" +
                    "【" + rows[index].account + "】", () => {
                    this.isLoading = true;
                    apiHandler.getUserApi().remove({uid: uid}, (data) => {
                        if (data.isSuccessful) {
                            Vue.$messageUtil.success(data.responseBody);
                            rows.splice(index, 1);
                        }
                        else {
                            Vue.$messageUtil.error(data.responseBody);
                        }
                        this.isLoading = false;
                    });
                });
            }
            ,
            updateRow(index, rows) {
                this.dialogTitle = "修改账号信息";
                this.selectedEntity = rows[index];
                this.dialogVisible = true;
            }
            ,
            updateRowForPersonalInfo(index, rows) {
                this.selectedEntity = rows[index];
                this.dialogVisible2 = true;
            }
            ,
            addRow() {
                this.dialogTitle = "添加新账号";
                this.dialogVisible = true;
                this.selectedEntity = null;
            }
            ,
            onDialogDone(editedRandlUser) {
                //更新的情况下
                if (editedRandlUser.uid) {
                    // this.selectedEntity = editedRegisteredUser;
                    this.selectedEntity.enabled = editedRandlUser.accountStatus === 1 ? true : false;
                    Object.keys(editedRandlUser).forEach(key => {
                        this.selectedEntity[key] = editedRandlUser[key];
                    });
                }
                //添加的情况下
                else {
                    this.obtainTableData();
                }

            }
        },
    }
</script>

<style scoped>

</style>

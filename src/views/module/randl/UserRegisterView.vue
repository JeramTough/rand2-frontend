<template>
    <div id="body">
        <el-row type="flex" align="middle">
            <el-col :span="24">
                <el-card class="box-card" shadow="always" style="background-color: rgba(211,255,228,0.71);">
                    <div slot="header" class="clearfix">
                        <span class="title">用户注册</span>
                        <router-link style="float: right; padding: 3px 0;color: #06bb28" to="userLogin">去登录
                        </router-link>
                    </div>

                    <!--第一步视图-->
                    <div v-if="steps===1">
                        <div v-if="form.way===1">
                            <div>
                                <el-input
                                        placeholder="请输入手机号码进行注册"
                                        v-model="form.phoneNumber"
                                        clearable>
                                </el-input>
                            </div>
                            <div>
                                <el-button type="text" @click.native.prevent="form.way=2">
                                    没有手机，用<span style="font-size: large;font-weight: bold">邮箱</span>注册？
                                </el-button>
                            </div>
                        </div>
                        <div v-if="form.way===2">
                            <div>
                                <el-input
                                        placeholder="请输入邮箱地址进行注册"
                                        v-model="form.emailAddress"
                                        clearable>
                                </el-input>
                            </div>
                            <div>
                                <el-button type="text" @click.native.prevent="form.way=1">
                                    没有邮箱，用<span style="font-size: large;font-weight: bold">手机</span>注册？
                                </el-button>
                            </div>
                        </div>
                    </div>

                    <!-- 第二步视图-->
                    <div v-if="steps===2">
                        <el-form :inline="true" class="demo-form-inline">
                            <el-form-item label="验证码">
                                <el-input
                                        placeholder="6位数字"
                                        v-model="form.verificationCode"
                                        clearable>
                                </el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" :loading="isDoing"
                                           v-bind:disabled="sendVerificationCodeButtonDisable" round
                                           @click="sendVerificationCode">
                                    {{sendVerificationCodeText}}
                                </el-button>
                            </el-form-item>
                        </el-form>
                    </div>

                    <!-- 第三步视图-->
                    <div v-if="steps===3">
                        <el-input v-model.lazy="form.password" autocomplete="off"
                                  placeholder="密码" @input="100"
                                  maxlength="16"
                                  show-password
                                  type="password"></el-input>
                        <el-input v-model.lazy="form.repeatedPassword" autocomplete="off"
                                  placeholder="确定密码" @input="100"
                                  style="margin-bottom: 20px;"
                                  maxlength="16"
                                  show-password
                                  type="password"></el-input>
                    </div>

                    <!-- 第三步视图-->
                    <div v-if="steps===4">
                        <div v-if="registeredUser!=null">
                            <i style="font-size: 100px;color: #00FF00;" class="el-icon-circle-check"></i>
                            <div style="margin-bottom: 20px;">用户【{{registeredUser.account}}】注册成功！</div>
                        </div>
                    </div>

                    <!--下一步按钮-->
                    <div>
                        <el-button type="primary" @click="nextStep" :loading="isDoing" round>
                            {{optionText}}
                        </el-button>
                    </div>

                </el-card>
            </el-col>
        </el-row>
        <el-row type="flex" align="middle" style="margin-top: 50px;text-align: left">
            <el-col :span="24">
                <el-steps :active="steps" style="margin-left: 10%;margin-right: 10%">
                    <el-step title="步骤 1" description="输入注册方式"
                             @click.native.prevent="steps=1"></el-step>
                    <el-step title="步骤 2" description="校验验证码"
                             @click.native.prevent="steps=2"></el-step>
                    <el-step title="步骤 3" description="设置密码"
                             @click.native.prevent="steps=3"></el-step>
                    <el-step title="步骤 4" description="完成"
                             @click.native.prevent="steps=4"></el-step>
                </el-steps>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import jsValidate from '@/util/JsValidate';
    import apiHandler from "@/api/base/ApiHandler";

    export default {
        name: "UserRegisterView",
        data: function () {
            return {
                steps: 1,
                isDoing: false,
                form: {
                    way: 1,
                    phoneNumber: null,
                    emailAddress: null,
                    verificationCode: null,
                    phoneOrEmail: null,
                    password: null,
                    repeatedPassword: null,
                    transactionId: null
                },
                sendVerificationCodeText: "发送验证码",
                sendVerificationCodeButtonDisable: false,
                registeredUser: null

            }
        },
        computed: {
            optionText: function () {
                if (this.steps === 4) {
                    return "完成"
                }
                else {
                    return "下一步 >";
                }
            }
        }
        ,
        methods: {
            nextStep: function () {
                let Vue = this;

                switch (this.steps) {
                    case 1:
                        var isFormatRight = false;
                        if (this.form.way === 1) {
                            if (jsValidate.validatePhone(this.form.phoneNumber)) {
                                isFormatRight = true;
                                this.form.phoneOrEmail = this.form.phoneNumber;
                            }
                            else {
                                this.$messageUtil.error("手机号码格式错误");
                            }
                        }
                        else if (this.form.way === 2) {
                            if (jsValidate.validateEmail(this.form.emailAddress)) {
                                isFormatRight = true;
                                this.form.phoneOrEmail = this.form.emailAddress;
                            }
                            else {
                                this.$messageUtil.error("邮箱格式错误");
                            }
                        }
                        if (isFormatRight) {
                            this.isDoing = true;
                            apiHandler.getUserApi().verifyPhoneOrEmailForNew(
                                {
                                    way: this.form.way,
                                    phoneOrEmail: this.form.phoneOrEmail
                                }, (data) => {
                                    if (data.isSuccessful) {
                                        Vue.$messageUtil.success1(data.responseBody.message);
                                        Vue._data.form.transactionId = data.responseBody.transactionId;
                                        Vue._data.steps++;
                                    }
                                    else {
                                        Vue.$messageUtil.error(data.responseBody);
                                    }
                                    Vue._data.isDoing = false;
                                });
                        }
                        break;
                    case 2:
                        if (this.form.verificationCode == null || this.form.verificationCode.length === 0) {
                            this.$messageUtil.error("验证码未填写");
                            break;
                        }

                        this.isDoing = true;
                        apiHandler.getVerificationCodeApi().verify(
                            {
                                phoneOrEmail: this.form.phoneOrEmail,
                                verificationCode: this.form.verificationCode
                            }, (data) => {
                                if (data.isSuccessful) {
                                    Vue.$messageUtil.success1(data.responseBody);
                                    Vue._data.steps++;
                                }
                                else {
                                    Vue.$messageUtil.error(data.responseBody);
                                }
                                Vue._data.isDoing = false;
                            });

                        break;
                    case 3:
                        if (this.form.password == null || this.form.password.length > 16 || this.form.password.length < 8) {
                            this.$messageUtil.error("密码格式不正确！允许长度范围在8-16位的非空白任意字符");
                            return;
                        }
                        if (this.form.password !== this.form.repeatedPassword) {
                            this.$messageUtil.error("两次密码不一致！");
                            return;
                        }
                        apiHandler.getUserApi().verifyPassword({
                            password: this.form.password,
                            repeatedPassword: this.form.repeatedPassword,
                            way: this.form.way,
                            transactionId: this.form.transactionId
                        }, (data) => {
                            if (data.isSuccessful) {
                                Vue.$messageUtil.success1(data.responseBody);
                                apiHandler.getUserApi().register({
                                    way: this.form.way,
                                    transactionId: this.form.transactionId
                                }, (data) => {
                                    if (data.isSuccessful) {
                                        Vue._data.registeredUser = data.responseBody;
                                        Vue._data.steps++;
                                    }
                                    else {
                                        Vue.$messageUtil.error(data.responseBody);
                                    }
                                    Vue._data.isDoing = false;
                                });
                            }
                            else {
                                Vue.$messageUtil.error(data.responseBody);
                                Vue._data.isDoing = false;
                            }

                        });
                        this.isDoing = true;

                        break;
                    case 4:
                        if (this.registeredUser == null) {
                            Vue.$messageUtil.error("注册未成功！");
                            return;
                        }

                        this.$router.push({
                            path: 'userLogin', query: {
                                phoneOrEmail: this.form.phoneOrEmail,
                                password: this.form.password
                            }
                        });

                        break;
                    default:
                        break;
                }
            }
            ,
            sendVerificationCode() {
                let Vue = this;
                if (!this.sendVerificationCodeButtonDisable) {
                    this.isDoing = true;
                    apiHandler.getVerificationCodeApi().send(
                        {
                            way: this.form.way,
                            phoneOrEmail: this.form.phoneOrEmail
                        }, (data) => {
                            if (data.isSuccessful) {
                                Vue._data.sendVerificationCodeButtonDisable = true;
                                Vue.$messageUtil.success1(data.responseBody);
                                let interval = 60;
                                Vue._data.sendVerificationCodeText = "等待（" + interval + "）秒";
                                let timer = self.setInterval(function () {
                                    Vue._data.sendVerificationCodeText = "等待（" + interval + "）秒";
                                    interval--;
                                    if (interval === -1) {
                                        window.clearInterval(timer);
                                        Vue._data.sendVerificationCodeButtonDisable = false;
                                        Vue._data.sendVerificationCodeText = "发送验证码";
                                    }
                                }, 1000);
                            }
                            else {
                                Vue.$messageUtil.error(data.responseBody);
                            }
                            Vue._data.isDoing = false;
                        });
                }

            },
        }
    }
</script>

<style scoped>
    #body {
        background-image: url("../../../assets/images/user_randl_bg1.jpg");
        height: 1000px;
        background-size: cover;

    }

    .el-card {
        margin-top: 10%;
        margin-left: 30%;
        margin-right: 30%;
    }

    .title {
        font-size: larger;
        font-weight: bolder;

    }
</style>
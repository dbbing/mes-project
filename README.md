## 注意事项
- 每周一若无人执行依赖包更新，则可以执行命令
  ```shell
  yarn upgrade-interactive --latest
  ```
- yarn方式的install可以准确引入`@vue/runtime-core`包，从而实现Typescript的interface提示，pnpm则无法引入该包。
- interface在能确认的情况下就写，无法确认就不写

## TODO
- [ ] 优化`src/components/`目录下的组件，使其更加通用
- [ ] 款式工序库前置工序选择
- [ ] 用户头像替换
- [ ] 快捷工单历史记录带类型
- [ ] 快捷工单所有内容带防抖和loading
- [ ] 工单状态添加补充
- [ ] 工单状态筛选为多选   
- [ ] 开工单动态校验勾选状态进行列表禁选
- [ ] 开工单动态表单校验
- [ ] 工序库智能提示
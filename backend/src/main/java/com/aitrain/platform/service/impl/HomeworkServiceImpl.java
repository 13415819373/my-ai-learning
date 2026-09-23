package com.aitrain.platform.service.impl;

import com.aitrain.platform.common.BusinessException;
import com.aitrain.platform.dto.HomeworkSubmitRequest;
import com.aitrain.platform.dto.HomeworkVO;
import com.aitrain.platform.entity.Homework;
import com.aitrain.platform.entity.HomeworkReview;
import com.aitrain.platform.entity.Task;
import com.aitrain.platform.entity.TrainStage;
import com.aitrain.platform.entity.User;
import com.aitrain.platform.mapper.HomeworkMapper;
import com.aitrain.platform.mapper.HomeworkReviewMapper;
import com.aitrain.platform.mapper.TaskMapper;
import com.aitrain.platform.mapper.TrainStageMapper;
import com.aitrain.platform.mapper.UserMapper;
import com.aitrain.platform.service.HomeworkService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.StringJoiner;

@Service
public class HomeworkServiceImpl implements HomeworkService {

    private final HomeworkMapper homeworkMapper;
    private final HomeworkReviewMapper reviewMapper;
    private final TaskMapper taskMapper;
    private final TrainStageMapper trainStageMapper;
    private final UserMapper userMapper;

    public HomeworkServiceImpl(HomeworkMapper homeworkMapper,
                               HomeworkReviewMapper reviewMapper,
                               TaskMapper taskMapper,
                               TrainStageMapper trainStageMapper,
                               UserMapper userMapper) {
        this.homeworkMapper = homeworkMapper;
        this.reviewMapper = reviewMapper;
        this.taskMapper = taskMapper;
        this.trainStageMapper = trainStageMapper;
        this.userMapper = userMapper;
    }

    @Override
    public void submit(Long userId, HomeworkSubmitRequest request) {
        if (request.getTaskId() == null) {
            throw new BusinessException("任务ID不能为空");
        }
        if ((request.getAiDialog() == null || request.getAiDialog().isBlank())
                && (request.getFileUrls() == null || request.getFileUrls().isEmpty())) {
            throw new BusinessException("请至少粘贴 AI 对话记录或上传文件");
        }

        Homework homework = new Homework();
        homework.setUserId(userId);
        homework.setTaskId(request.getTaskId());
        homework.setAiDialog(request.getAiDialog());
        if (request.getFileUrls() != null && !request.getFileUrls().isEmpty()) {
            StringJoiner joiner = new StringJoiner(",");
            request.getFileUrls().forEach(joiner::add);
            homework.setFileUrls(joiner.toString());
        }
        homework.setStatus("pending");
        homework.setSubmitTime(LocalDateTime.now());
        homework.setDeleted(0);
        homeworkMapper.insert(homework);
    }

    @Override
    public List<HomeworkVO> myHomeworks(Long userId) {
        List<Homework> list = homeworkMapper.selectList(
                new LambdaQueryWrapper<Homework>()
                        .eq(Homework::getUserId, userId)
                        .orderByDesc(Homework::getSubmitTime));
        return buildVO(list, null, null);
    }

    @Override
    public List<HomeworkVO> listAll(String status) {
        List<Homework> list = homeworkMapper.selectList(
                new LambdaQueryWrapper<Homework>()
                        .eq(status != null && !status.isBlank(), Homework::getStatus, status)
                        .orderByDesc(Homework::getSubmitTime));
        return buildVO(list, null, null);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void review(Long teacherId, Long homeworkId, Integer score, String comment) {
        Homework homework = homeworkMapper.selectById(homeworkId);
        if (homework == null) {
            throw new BusinessException("作业不存在");
        }

        // 幂等：同一份作业只保留一条批改记录
        HomeworkReview existing = reviewMapper.selectOne(
                new LambdaQueryWrapper<HomeworkReview>().eq(HomeworkReview::getHomeworkId, homeworkId));
        if (existing != null) {
            existing.setScore(score);
            existing.setComment(comment);
            existing.setReviewTime(LocalDateTime.now());
            reviewMapper.updateById(existing);
        } else {
            HomeworkReview review = new HomeworkReview();
            review.setHomeworkId(homeworkId);
            review.setTeacherId(teacherId);
            review.setScore(score);
            review.setComment(comment);
            review.setReviewTime(LocalDateTime.now());
            reviewMapper.insert(review);
        }

        homework.setStatus("reviewed");
        homeworkMapper.updateById(homework);
    }

    private List<HomeworkVO> buildVO(List<Homework> list, String status, Long userId) {
        List<HomeworkVO> result = new ArrayList<>();
        for (Homework hw : list) {
            HomeworkVO vo = new HomeworkVO();
            vo.setHomework(hw);

            User student = userMapper.selectById(hw.getUserId());
            if (student != null) {
                vo.setStudentName(student.getNickname());
            }

            Task task = taskMapper.selectById(hw.getTaskId());
            if (task != null) {
                vo.setTaskTitle(task.getTaskTitle());
                TrainStage stage = trainStageMapper.selectById(task.getStageId());
                if (stage != null) {
                    vo.setStageName(stage.getStageName());
                }
            }

            HomeworkReview review = reviewMapper.selectOne(
                    new LambdaQueryWrapper<HomeworkReview>().eq(HomeworkReview::getHomeworkId, hw.getId()));
            vo.setReview(review);

            result.add(vo);
        }
        return result;
    }
}

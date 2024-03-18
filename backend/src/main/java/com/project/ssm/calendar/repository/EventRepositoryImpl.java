package com.project.ssm.calendar.repository;

import com.project.ssm.calendar.model.entity.Event;
import com.project.ssm.calendar.model.entity.QEvent;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RequiredArgsConstructor
public class EventRepositoryImpl implements EventCustomRepository {

    private final JPAQueryFactory queryFactory;

    @Override
    public List<Event> findEventsByYear(Long memberIdx, int year) {

        QEvent event = QEvent.event;

        return queryFactory
                .selectFrom(event)
                .where(
                        event.member.memberIdx.eq(memberIdx),
                        event.startedAt.substring(0,4).eq(String.valueOf(year)).or(event.closedAt.substring(0,4).eq(String.valueOf(year)))
                )
                .fetch();
    }

    @Override
    public List<Event> findByYear(int year) {

        QEvent event = QEvent.event;

        return queryFactory
                .selectFrom(event)
                .where(
                        event.startedAt.substring(0,4).eq(String.valueOf(year)).or(event.closedAt.substring(0,4).eq(String.valueOf(year)))
                )
                .fetch()
                ;
    }
}